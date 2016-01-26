/**
 * GoogleDirections is a Backbone model representing a set of driving directions from Google.
 *
 */
define(function () {
    "use strict";
    var GoogleDirectionService = function (args) {
        this.initialize(args);
    };


    GoogleDirectionService.prototype.initialize = function (args) {
        this.directionService = new google.maps.DirectionsService();
        if (args && args.transitMode) {
            this.transitMode = args.transitMode;
        } else {
            this.transitMode = 'Bicycling';
        }
    };

    GoogleDirectionService.prototype.fetch = function (options) {
        var start = {lat: options.origin[1], lng: options.origin[0]};
        var finish = {lat: options.destination[1], lng: options.destination[0]};
        var transitMode = google.maps.TravelMode.WALKING;
        if (this.transitMode == 'Bicycling') {transitMode = google.maps.TravelMode.BICYCLING;}
        var directionsRequest = {origin: start, destination: finish, travelMode: transitMode,
            provideRouteAlternatives: false, avoidHighways: true, avoidTolls: true};
        this.directionService.route(directionsRequest, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var directionsRoute = response.routes[0];
                var meters = 0;
                for (var x = 0; x < directionsRoute.legs.length; x++) {
                    meters += directionsRoute.legs[x].distance.value;
                }
                var points = [];
                $.each(directionsRoute.overview_path, function (i, point) {
                    points.push([point.lng(), point.lat(), 0, 0]);
                });
                options.success({points: points, meters: meters, status: status});
            } else {
                options.error(response, status);
            }
        });
    };


    return GoogleDirectionService;
});
