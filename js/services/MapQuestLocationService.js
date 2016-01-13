/**
 * OsmGeoCoder is a Backbone model representing a place on an OSM map
 *
 */
"use strict";
define(function (require) {
    var Location = require('models/Location');

    var OsmGeoCoder = function (args) {};

    OsmGeoCoder.prototype._buildUrl = function (query) {
        var baseURL = "http://www.mapquestapi.com/geocoding/v1/address?key=E1aPfpcd72j9wfglxliaYXnCeKO4pFD1&inFormat=kvp&outFormat=json&maxResults=1&thumbMaps=false";
        return baseURL + this._buildQuery(query);
    };

    OsmGeoCoder.prototype._buildQuery = function (query) {
        return '&location=' + query.split(' ').join('+');
    };

    OsmGeoCoder.prototype.fetch = function (options) {
        var location = new Location({query: options.query});
        $.ajax({
            url: this._buildUrl(options.query),
            method: 'GET',
            jsonp: true,
            success: function (response) {

                var info = response.info;
                if (info.statuscode === 0) {
                    var results = response.results[0];
                    var place = results.locations[0];
                    var latLng = place.latLng;
                    location.set({lat: latLng.lat, lon: latLng.lng});
                    options.success({location: location});
                } else {
                    options.error(info.messages, info.statuscode);
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
