/**
 * Features is a Backbone Collection of GeoJson Feature Models.
 */
define([
    'backbone',
    'models/Feature'
], function (Backbone, Feature) {
    var Features = Backbone.Collection.extend({
        model: Feature,

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
        }
    });

    return Features;
});
