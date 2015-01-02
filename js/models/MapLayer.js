define([
    'backbone'
], function (Backbone) {
    var MapLayer = Backbone.Model.extend({
    });
    MapLayer.ROAD = 'road';
    MapLayer.SATELLITE = 'satellite';
    MapLayer.TERRAIN = 'terrain';
    MapLayer.HYBRID = 'hybrid';
    MapLayer.TRAILS = 'trails';
    return MapLayer;
});
