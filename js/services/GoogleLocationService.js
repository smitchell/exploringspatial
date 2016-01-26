/**
 * GoogleGeoCoder is a Backbone model representing a place on a Google map
 *
 */
define(function (require) {
    "use strict";
    var Location = require('models/Location');

    var GoogleLocationService = function (args) {
    };

    GoogleLocationService.prototype.fetch = function (options) {
        var location = new Location({query: options.query});
        var googleGeoCoder = new google.maps.Geocoder();
        googleGeoCoder.geocode({'address': options.query}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                location.set({
                    lat: results[0].geometry.location.lat(),
                    lon: results[0].geometry.location.lng(),
                    name: results.formatted_address
                });
                if (typeof options != 'undefined' && options.success != 'undefined') {
                    options.success({'location': location});
                }
            }
            if (typeof options != 'undefined' && options.complete != 'undefined') {
                options.complete({location: location, status: status});
            }
        })
    }

    return GoogleLocationService;
});
