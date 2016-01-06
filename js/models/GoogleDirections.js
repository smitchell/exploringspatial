/**
 * GoogleDirections is a Backbone model representing a set of driving directions from Google.
 *
 */
define([
    'jquery',
    'backbone'
], function ($, Backbone) {
    var GoogleDirections = Backbone.Model.extend({

        defaults: {
            transitMode: 'Walking'
        },

        initialize: function(args ) {
            this.directionService = new google.maps.DirectionsService();
            this.dispatcher = args.dispatcher;
        },

        fetch: function (options) {
            // Backbone does not like the response from Google directions.
            var origin = this.get('origin');
            if (!origin) {
                throw new Error('GoogleDirections: origin is required.');
            }
            var destination = this.get('destination');
            if (!destination) {
                throw new Error('GoogleDirections: destination is required.');
            }
            var _this = this;
            var start = {lat: origin[1], lng: origin[0]};
            console.log(JSON.stringify(start));
            var finish = {lat: destination[1], lng: destination[0]};
            console.log(JSON.stringify(finish));
            var transitMode = google.maps.TravelMode.WALKING;
            if(this.get('transitMode') == 'Bicycling') {
                transitMode = google.maps.TravelMode.BICYCLING;
            }
            var directionsRequest = {
                        origin: start,
                        destination: finish,
                        travelMode: transitMode,
                        provideRouteAlternatives: false,
                        avoidHighways: true,
                        avoidTolls: true
                    };
            this.directionService.route(directionsRequest, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var directionsRoute = response.routes[0];
                    var meters = 0;
                    for (var x = 0; x < directionsRoute.legs.length; x++) {
                        meters += directionsRoute.legs[x].distance.value;
                    }
                    var points = [];
                    $.each(directionsRoute.overview_path, function(i, point){
                        points.push([point.lng(), point.lat(), 0, 0]);
                    });
                    _this.set({polyline: points, meters: meters});
                    options.success(response, status);
                } else {
                    options.error(response, {status: status, responseText: response});
                }
            });
        }

    });
    return GoogleDirections;
});
