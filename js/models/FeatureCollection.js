/**
 * FeatureCollection is a Backbone model representing a GeoJSON FeatureCollection.
 *
 * http://geojson.org/geojson-spec.html#feature-collection-objects
 *
 * A GeoJSON object with the type "FeatureCollection" is a feature collection object.

 An object of type "FeatureCollection" must have a member with the name "features". The value corresponding to "features" is an array. Each element in the array is a feature object as defined above.
 *
 */
define([
    'underscore',
    'backbone',
    'collectin/Features'
], function (_, Backbone, Features) {
    var FeatureCollection = Backbone.Model.extend({

        default: {
            type: "FeatureCollection",
            features: new Features()
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
    return FeatureCollection;
});
