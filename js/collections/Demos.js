/**
 * Demos is a Backbone Collection of Demo Backbone Models.
 * Each model represents a site demo description.
 */
define([
        'backbone',
        'models/Demo'
], function(Backbone, Demo) {
var Demos = Backbone.Collection.extend({
    url: "http://data.exploringspatial.com/demos.json",
   	model: Demo,

    parse: function(response) {
        return response.demos;
    }
});

    return Demos;
});
