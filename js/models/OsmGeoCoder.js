/**
 * OsmGeoCoder is a Backbone model representing a place on an OSM map
 *
 */
define([
    'models/Location'
], function (Location) {
    var OsmGeoCoder = Location.extend({
        urlRoot: "http://nominatim.openstreetmaps.org/search",

        url: function() {
            return this.urlRoot + this.buildQuery() + '&limit=1&format=json';
        },

        buildQuery: function() {
            var query = this.get('query');
            return '?q=' + query.split(' ').join('+');
        },

        parse: function(result) {
            if (result.length == 0) {
                return {};
            }
            return result[0];
        }
    });
    return OsmGeoCoder;
});
