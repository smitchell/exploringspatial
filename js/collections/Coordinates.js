/**
 * Coordinates is a Backbone Collection of GeoJson Coordinates Models.
 */
define([
    'backbone',
    'models/Coordinate'
], function (Backbone, Coordinate) {
    var Coordinates = Backbone.Collection.extend({
        model: Coordinate

    });

    return Coordinates;
});
