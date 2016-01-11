'use strict';
/**
 * MapQuestDirections is a Backbone model representing a set of driving directions from MapQuest.
 *
 */
define(function (require) {
    var MapQuestDirectionService = function (args) {
        this.initialize(args);
    };

    MapQuestDirectionService.prototype.initialize = function (args) {
        if (args && args.transitMode) {
            this.transitMode = args.transitMode;
        } else {
            this.transitMode = 'Bicycling';
        }
    };

    MapQuestDirectionService.prototype.fetch = function (options) {
        var routeType = 'pedestrian';
        if (this.transitMode == 'Bicycling') {
            routeType = 'bicycle';
        }

        var url = ['http://www.mapquestapi.com/directions/v2/route?key=E1aPfpcd72j9wfglxliaYXnCeKO4pFD1'];
        url.push('&avoids=Limited Access');
        url.push('&avoids=Toll road');
        url.push('&outFormat=json');
        url.push('&routeType=' + routeType);
        url.push('&timeType=1');
        url.push('&narrativeType=none');
        url.push('&enhancedNarrative=false');
        url.push('&shapeFormat=raw');
        url.push('&generalize=0');
        url.push('&locale=en_US');
        url.push('&unit=m');
        url.push('&from=' + options.origin[1] + ',' + options.origin[0]);
        url.push('&to=' + options.destination[1] + ',' + options.destination[0]);
        url.push('&drivingStyle=2');
        url.push('&highwayEfficiency=21.0');

        $.ajax({
            url: url.join(''),
            method: 'GET',
            dataType: 'json',
            jsonp: true,
            success: function (response) {
                var info = response.info;
                if (info.statuscode === 0) {
                    var route = response.route;
                    var meters = 0;
                    $.each(route.legs, function (i, leg) {
                        meters += leg.distance;
                    });
                    var points = [];
                    var lat = null;
                    var point;
                    $.each(route.shape.shapePoints, function (i, ordinate) {
                        if (lat === null) {
                            lat = ordinate;
                        } else {
                            points.push([ordinate, lat, 0, 0]);
                            lat = null;
                        }
                    });
                    options.success({points: points, meters: meters, status: status});
                } else {
                    options.error(info.messages.join(" "), info.statuscode);
                }
            },
            error: function (response, status) {
                options.error(response, status);
            }
        });
    };


    return MapQuestDirectionService;
});
