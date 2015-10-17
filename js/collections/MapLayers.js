/**
 * MapLayers is a Backbone Collection of MapLayer Backbone models.
 * A map provided, such as Google, has a collection of MapLayer models that it supports.
 */
define([
    'backbone',
    'models/MapLayer'
], function (Backbone, MapLayer) {
    var MapLayers = Backbone.Collection.extend({
        model: MapLayer,

        /**
         * Convenience function to locate a map later by layer type
         * (MapLayer.ROAD, MapLayer.HYBRID, ect...)
         * @param type - The type for which a map layer will be returned.
         * @return {MapLayer} - The map Layer of the given map layer type.
         */
        findByType: function(type) {
            var result = null;
            this.each(function(mapLayer) {
                if (mapLayer.get('type') == type) {
                    result = mapLayer;
                }
            });
            return result;
        },

        /**
         * Changes the selected map layer in the collection.
         * Only one base layer may be selected at a time.
         * @param type - The map layer type to be selected.
         * @returns {MapLayer} - The base layer matching the given map layer type.
         */
        changeBaseLayer: function(type) {
            var baseLayer = null;
            var isChanged = false;
            this.each(function(mapLayer) {
                if (mapLayer.get('isBaseLayer') && mapLayer.get('type') == type) {
                    baseLayer = mapLayer;
                    // Only take action if the current layer is not already the current layer.
                    if(!mapLayer.get('isSelected')) {
                        isChanged =  true;
                    }
                } else if (mapLayer.get('isSelected')) {
                    mapLayer.set({isSelected: false });
                }
            });
            // Defer switch until all other layers are set to false.
            if (isChanged != null) {
                baseLayer.set({isSelected: true });
            }
            return baseLayer;
        },
        getSelectedBaseLayer: function() {
            var result = null;
            this.each(function(mapLayer) {
                if (mapLayer.get('isSelected') == true) {
                    result = mapLayer;
                }
            });
            return result;
        }
    });

    return MapLayers;
});
