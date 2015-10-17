/**
 * Location is a Backbone model representing a place in the world
 *
 */
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var Location = Backbone.Model.extend({
        defaults: {
            lat: 38.35888,
            lon: -88.92334,
            zoom: 10
        }
    });
    return Location;
});
