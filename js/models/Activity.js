/**
 * Activity is a Backbone model representing a Garmin Activity.
 *
 * See http://geojson.org/geojson-spec.html#feature-objects
 *
 * A GeoJSON object with the type "Feature" is a feature object.
 * <ul>
 * <li> A feature object must have a member with the name "geometry". The value of the geometry member is a geometry object as defined above or a JSON null value.</li>
 *
 * <li> A feature object must have a member with the name "properties". The value of the properties member is an object (any JSON object or a JSON null value).</li>
 *
 * <li> If a feature has a commonly used identifier, that identifier should be included as a member of the feature object with the name "id".</li>
 * </ul>
 *
 */
define([
    'underscore',
    'backbone',
    'models/Geometry',
    'models/Properties'
], function (_, Backbone, Geometry, Properties) {
    var Activity = Backbone.Model.extend({
        urlRoot: "http://data.byteworksinc.com/activity/",
        idAttribute: "activityId",

        default: {
            type: "Feature"
        },

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
        toJSON: function () {
            var json = _.clone(this.attributes);
            for (var attr in json) {
                if ((json[attr] instanceof Backbone.Model) || (json[attr] instanceof Backbone.Collection)) {
                    json[attr] = json[attr].toJSON();
                }
            }
            return json;
        },

        /**
         * The "metrics" property is a make of the metric names
         * corresponding to the values in each coordinant array.
         * The purpose of this method is to return the index of
         * the coorinate value corresponding to the requested name.
         *
         * @param name - The name of the metric.
         * @returns {number} - The index of the value in coordiante array corresponding to the metric name.
         */
        getMetricIndex: function(name) {
            var index = -1;
            var properties = this.get('properties');
            if (properties && properties != null) {
                var metrics = properties.get('metrics');
                if (metrics && metrics != null) {
                    for (var i = 0; i < metrics.length - 1; i++) {
                        if (metrics[i] === name) {
                            index = i;
                            break;
                        }
                    }
                }

            }
            return index;
        }
    });
    return Activity;
});
