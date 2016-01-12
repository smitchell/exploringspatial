/**
 * MapProvider is a high-level Backbone model. It is the parent model to vendor specific models.
 * It contains functions common to all vendor specific models.
 */
define([
    'backbone',
    'collections/MapLayers'
], function (Backbone, MapLayers) {
    var MapProvider = Backbone.Model.extend({

        /**
         * The purpose of this function is to test whether this MapProvide
         * supports the given MapLayer type. For example, Google supports the HYBRID
         * map layer type, but Bing does not.
         * @param type - Map layer type to test for provider support.
         * @returns {boolean} True if the map layer type is supported by this map provider.
         */
        supportsLayerType: function (type) {
            var result = false;
            this.get('mapLayers').each(function (mapLayer) {
                if (mapLayer.get('type') == type) {
                    result = true;
                }
            });
            return result;
        },

        /**
         * The purpose of this function is to fire the PROVIDER_CHANGED event when the
         * isSelected property is changed to true.
         */
        onMapProviderChanged: function() {
            if (this.get('isSelected')) {
                this.dispatcher.trigger(this.dispatcher.Events.PROVIDER_CHANGED, {
                    type: this.dispatcher.Events.PROVIDER_CHANGED,
                    mapProvider: this
                });
            }
        }
    });
    MapProvider.GOOGLE = 'google';
    //MapProvider.BING = 'bing';
    MapProvider.OSM = 'osm';
    return MapProvider;
});
