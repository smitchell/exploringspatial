/**
 * MultiLineString is a Backbone model representing a GeoJSON MultiLineString.
 *
 * See http://geojson.org/geojson-spec.html#multilinestring
 *
 *  For type "MultiLineString", the "coordinates" member must be an array of LineString coordinate arrays.
 *
 */
define([
    'underscore',
    'backbone',
    'collection/Coordinates'
], function (_, Backbone, Coordinates) {
    var MultiLineString = Backbone.Model.extend({

        default: {
            type: "MultiLineString",
            coordinates: new Coordinates()
        },

        /**
         * Override Backbone toJSON to return child Backbone models into properties of properties.
         */
        toJSON: function() {
            var json = _.clone(this.attributes);
            for(var attr in json) {
              if((json[attr] instanceof Backbone.Model) || (json[attr] instanceof Backbone.Collection)) {
                json[attr] = json[attr].toJSON();
              }
            }
            return json;
        }
    });
    return MultiLineString;
});
