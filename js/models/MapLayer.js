define([
    'backbone'
], function (Backbone) {
    var MapLayer = Backbone.Model.extend({
    });
    MapLayer.ROAD = 'road';
    MapLayer.SATELLITE = 'satellite';
    return MapLayer;
});
