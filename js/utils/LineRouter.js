"use strict";
/**
 * Fetches directions for Lines in a sequential manner.
 */
define(function (require) {
    var GoogleDirections = require('models/GoogleDirections');

    var LineRouter = function () {
        this.initialize.apply(this, arguments);
    };

    LineRouter.prototype({

        initialize: function (args) {
            this.directionRequests = [];
            this.directionRequest = null;
            this.mapLayerName = 'google';
        },

        getDirections: function (options) {
            this.directionRequests.push(options);
            this._fetchDirections();
        },

        _fetchDirections: function () {
            if (this.directionRequest === null) {
                this.directionRequest = this.directionRequests.pop();
                switch (this.mapLayerName) {
                    case 'google':
                        this._googleDirections(this.directionRequest.line);
                        break;
                    default:
                        this._mapQuestDirections(this.directionRequest.line);
                        break;
                }
            }
        },

        _onSuccess: function (lineString) {
            // update the current line
            if (this.directionRequest !== null) {
                this.directionRequest.success(lineString);
                this.dispatcher.trigger(this.dispatcher.Events.LINE_CHANGE, {
                    line: this.directionRequest.line
                });
                this.directionRequest = null;
            }
            if (this.directionRequests.length > 0) {
                this._fetchDirections();
            }
        },

        _googleDirections: function (line) {
            var _this = this;
            var start = line[0];
            var finish = line[line.length - 1];
            var googleDirections = new GoogleDirections();
            googleDirections.set({origin: start, destination: finish});
            googleDirections.fetch({
                success: function () {
                    _this.onSuccess({'lineString': this.googleDirections.get('polyline')});
                },
                error: function (object, xhr) {
                    _this.loading -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });

        },

        _mapQuestDirections: function (line) {

        }
    });
    return LineRouter;
});


