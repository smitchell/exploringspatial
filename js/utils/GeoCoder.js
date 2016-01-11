"use strict";
/**
 * GeoCoder is an abstraction of geolocation services tied to the selected base map.
 *
 */
define(function (require) {
    var GoogleLocationService = require('services/GoogleLocationService');
    var MapQuestLocationService = require('services/MapQuestLocationService');

    var GeoCoder = function (args) {
        this.initialize(args);
    };

    GeoCoder.prototype.initialize = function (args) {
        this.throttleMilliseconds = 250;
        this.geoCodingRequests = [];
        this.geoCodingRequest = null;
        this.activeLayers = args.activeLayers;
        this.lastTimestamp = 0;
        this.googleLocationService = new GoogleLocationService();
        this.mapQuestLocationService = new MapQuestLocationService();
    };

    GeoCoder.prototype.geoCodeLocation = function (geoCodingRequest) {
        this.geoCodingRequests.push(geoCodingRequest);
        this._fetchNextLocation();
    };

    GeoCoder.prototype._fetchNextLocation = function () {
        if (this.geoCodingRequest === null && this.geoCodingRequests.length > 0) {
            var elapsedTime = new Date().getTime() - this.lastTimestamp;
            if (elapsedTime > this.throttleMilliseconds) {
                this.geoCodingRequest = this.geoCodingRequests.pop();
                var currentBaseMap = this.activeLayers.getActiveBaseLayer();
                switch (currentBaseMap.name) {
                    case 'Google':
                        this._getLocationFromGoogle(this.geoCodingRequest.query);
                        break;
                    default:
                        this._getLocationFromMapQuest(this.geoCodingRequest.query);
                        break;
                }
            } else {
                var _this = this;
                setTimeout(function(){
                    _this._fetchNextLocation();
                }, this.throttleMilliseconds);
            }
        }
    };

    GeoCoder.prototype._onSuccess = function (result) {
        if (this.geoCodingRequest !== null) {
            this.geoCodingRequest.success(result);
        }
    };

    GeoCoder.prototype._onError = function (response, status) {
        if (this.geoCodingRequest !== null) {
            this.geoCodingRequest.error(response, status);
        }
        if (console.log) {
            console.log(response);
            console.log(status);
        }
    };

    GeoCoder.prototype._onComplete = function () {
        if (this.geoCodingRequest !== null && this.geoCodingRequest.complete) {
            this.geoCodingRequest.complete();
        }
        this.geoCodingRequest = null;
        this._fetchNextLocation();
    };

    GeoCoder.prototype._getLocationFromGoogle = function (query) {
        var _this = this;
        this.lastTimestamp = new Date().getTime();
        this.googleLocationService.fetch({
            query: query,
            success: function (response) {
                _this._onSuccess({'location': response.location});
            },
            error: function (response, status) {
                if (status === 'OVER_QUERY_LIMIT') {
                    setTimeout(function(){
                        _this._fetchNextLocation();
                    }, _this.throttleMilliseconds);
                }  else {
                    _this._onError(response, status);
                }
                if (console.log && status) {
                    console.log(status);
                }
            },
            complete: function() {
                _this._onComplete();
            }

        });
    };

    GeoCoder.prototype._getLocationFromMapQuest = function (query) {
        var _this = this;
        this.lastTimestamp = new Date().getTime();
        this.mapQuestLocationService.fetch({
            query: query,
            success: function (response) {
                _this._onSuccess({'location': response.location});
            },
            error: function (response, status) {
                if (status === 'OVER_QUERY_LIMIT') {
                    setTimeout(function(){
                        _this._fetchNextLocation();
                    }, _this.throttleMilliseconds);
                }  else {
                    _this._onError(response, status);
                }
                if (console.log && status) {
                    console.log(status);
                }
            },
            complete: function() {
                _this._onComplete();
            }
        });
    };

    return GeoCoder;
});
