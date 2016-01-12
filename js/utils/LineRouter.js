"use strict";
/**
 * Fetches directions for Lines in a sequential manner.
 */
define(function (require) {
    var GoogleDirectionService = require('services/GoogleDirectionService');
    var MapQuestDirectionService = require('services/MapQuestDirectionService');

    var LineRouter = function (args) {
        this.initialize(args);
    };

    LineRouter.prototype.initialize = function (args) {
        this.throttleMilliseconds = 250;
        this.directionRequests = [];
        this.directionRequest = null;
        this.transitMode = args.transitMode;
        this.dispatcher = args.dispatcher;
        this.activeLayers = args.activeLayers;
        this.lastTimestamp = 0;
    };

    LineRouter.prototype.getDirections = function (options) {
        this.directionRequests.push(options);
        this._fetchNextDirections();
    };

    LineRouter.prototype._fetchNextDirections = function () {
        if (this.directionRequest === null && this.directionRequests.length > 0) {
            var elapsedTime = new Date().getTime() - this.lastTimestamp;
            if (elapsedTime > this.throttleMilliseconds) {
                this.directionRequest = this.directionRequests.pop();
                var currentBaseMap = this.activeLayers.getActiveBaseLayer();
                switch (currentBaseMap.name) {
                    case 'Google':
                        this._googleDirections(this.directionRequest.line);
                        break;
                    default:
                        this._mapQuestDirections(this.directionRequest.line);
                        break;
                }
            } else {
                var _this = this;
                setTimeout(function(){
                    _this._fetchNextDirections();
                }, this.throttleMilliseconds);
            }
        }
    };

    LineRouter.prototype._onSuccess = function (result) {
        if (this.directionRequest !== null) {
            this.directionRequest.success(result.lineString);
            this.directionRequest = null;
        }
        this._fetchNextDirections();
    };

    LineRouter.prototype._onError = function (response, status) {
        if (this.directionRequest !== null) {
            this.directionRequest.error(response, status);
            this.directionRequest = null;
        }
        if (console.log) {
            console.log(response);
            console.log(status);
        }
        this._fetchNextDirections();
    };

    LineRouter.prototype._googleDirections = function (line) {
        var _this = this;
        var start = line[0];
        var finish = line[line.length - 1];
        this.lastTimestamp = new Date().getTime();
        var googleDirectionService = new GoogleDirectionService({
            transitMode: this.transitMode});
        googleDirectionService.fetch({
            origin: start,
            destination: finish,
            success: function (response) {
                _this._onSuccess({'lineString': response.points});
            },
            error: function (response, status) {
                if (status === 'OVER_QUERY_LIMIT') {
                    setTimeout(function(){
                        _this._fetchNextDirections();
                    }, _this.throttleMilliseconds * 4);
                }  else {
                    _this._onError(response, status);
                }
                if (console.log && status) {
                    console.log(status);
                }
            }
        });

    };

    LineRouter.prototype._mapQuestDirections = function (line) {
        var _this = this;
        var start = line[0];
        var finish = line[line.length - 1];
        this.lastTimestamp = new Date().getTime();
        var mapQuestDirectionService = new MapQuestDirectionService({
                    transitMode: this.transitMode});
        mapQuestDirectionService.fetch({
            origin: start,
            destination: finish,
            success: function (response) {
                _this._onSuccess({'lineString': response.points});
            },
            error: function (response, status) {
                _this._onError(response, status);
                if (console.log && status) {
                    console.log(status);
                }
            }
        });
    };

    LineRouter.prototype.getTransitMode = function () {
        return this.transitMode;
    };

    LineRouter.prototype.setTransitMode = function (transitMode) {
        this.transitMode = transitMode;
    };


    LineRouter.TRANSIT_MODE_BICYCLING = 'Bicycling';
    LineRouter.TRANSIT_MODE_RUNNING = 'Running';
    LineRouter.TRANSIT_MODE_WALKING = 'Walking';

    return LineRouter;
});


