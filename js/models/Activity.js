/**
 * Activity is a Backbone model representing a Garmin Activity.
 *
 */
define([
    'backbone',
    'models/Geometry',
    'models/Properties'
], function (Backbone, Geometry, Properties) {
    var Activity = Backbone.Model.extend({
        // This is just a demo class, so no activity Id is used.
        url: "feature.json",

        parse: function (data) {
            var json = {};
            json.type = data.type;
            json.geometry = new Geometry(data.geometry);
            json.properties = new Properties(data.properties);
            json.id = data.id;
            return json;
        }
    });
    return Activity;
});
