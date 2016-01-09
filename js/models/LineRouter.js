"use strict";
/**
 * Fetches directions for Lines in a sequential manner.
 */
define(function(require) {
    var GoogleDirections       = require('models/GoogleDirections');

    var LineRouter = {
        lineStack: [],
        currentLine: null,
        mapLayerName: 'google',

        getDirections: function(line) {
            this.lineStack.push(line);
            this._fetchDirections();
        },

        _fetchDirections: function() {
            if (this.currentLine === null) {
                this.currentLine = this.lineStack.pop();
                switch(this.mapLayerName) {
                    case 'google':
                        this._googleDirections(this.currentLine);
                        break;
                    default:
                        this._mapQuestDirections(this.currentLine);
                        break;
                }
            }
        },

        _onSuccess: function(response) {
            // update the current line
            // ...
            if (this.lineStack.length > 0) {
                this._fetchDirections();
            }
        },

        _googleDirections: function(line) {

        },

        _mapQuestDirections: function(line) {

        }
    };
    return LineRouter;
});


