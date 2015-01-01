define([
    'backbone',
    'models/MapLayer'
], function (Backbone, MapLayer) {
    var MapLayers = Backbone.Collection.extend({
        model: MapLayer,
        findByType: function(type) {
            var result = null;
            this.each(function(mapLayer) {
                if (mapLayer.get('type') == type) {
                    result = mapLayer;
                }
            });
            return result;
        },
        changeCurrentLayer: function(type) {
            var currentLayer = null;
            this.each(function(mapLayer) {
                if (mapLayer.get('type') == type) {
                    mapLayer.set({currentLayer: true });
                    currentLayer = mapLayer;
                } else {
                    mapLayer.set({currentLayer: false });
                }
            });
            return currentLayer;
        },
        getCurrentLayer: function() {
            var result = null;
            this.each(function(mapLayer) {
                if (mapLayer.get('currentLayer') == true) {
                    result = mapLayer;
                }
            });
            return result;
        }
    });

    return MapLayers;
});
