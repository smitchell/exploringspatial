/**
 * OsmGeoCoder is a Backbone model representing a place on an OSM map
 *
 */
"use strict";
define(function (require) {
    var Location = require('models/Location');

    var OsmGeoCoder = function (args) {};

    OsmGeoCoder.prototype._buildUrl = function (query) {
        return "http://nominatim.openstreetmaps.org/search" + this._buildQuery(query) + '&limit=1&format=json';
    };

    OsmGeoCoder.prototype._buildQuery = function (query) {
        return '?q=' + query.split(' ').join('+');
    };

    OsmGeoCoder.prototype.fetch = function (options) {
        var location = new Location({query: options.query});
        $.ajax({
            url: this._buildUrl(options.query),
            method: 'GET',
            dataType: 'json',
            jsonp: true,
            success: function (response) {
                if (response.length > 0) {
                    var place = response[0];
                    location.set({lat: place.lat, lon: place.lon, boundingbox: place.boundingbox});
                    options.success({location: location});
                } else {
                    options.error("No results");
                }
            },
            error: function (response, status) {
                options.error(response, status);
            },
            complete: function() {
                if (typeof options != 'undefined' && options.complete != 'undefined') {
                    options.complete({location: location, status: status});
                }
            }
        });
    };

    return OsmGeoCoder;
});
