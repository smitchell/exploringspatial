/**
 * Activity is a Backbone model representing a GeoJsonFeature.
 *
 */
define([
    'underscore',
    'backbone',
    'models/Geometry',
    'models/Properties'
], function (_, Backbone, Geometry, Properties) {
    var GeoJsonFeature = Backbone.Model.extend({

        /**
         * Override Backbone parse to convert properties of properties into child Backbone models.
         * @param data
         * @returns {{}}
         */
        parse: function (json) {
            json.geometry = new Geometry(json.geometry);
            json.properties = new Properties(json.properties);
            return json;
        },

        /**
         * Override Backbone toJSON to return child Backbone models into properties of properties.
         */
        toJSON: function() {
            var json = _.clone(this.attributes);
            for (var attr in json) {
                if((json[attr] instanceof Backbone.Model)) {
                    json[attr] = json[attr].toJSON();
                }
            }
            return json;
        }
    });
    return GeoJsonFeature;
});
