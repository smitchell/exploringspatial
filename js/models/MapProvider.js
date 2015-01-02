define([
    'backbone',
    'collections/MapLayers'
], function (Backbone, MapLayers) {
    var MapProvider = Backbone.Model.extend({
        supportsLayerType: function (type) {
            var result = false;
            this.get('mapLayers').each(function (mapLayer) {
                if (mapLayer.get('type') == type) {
                    result = true;
                }
            });
            return result;
        },
        onMapProviderChanged: function() {
            if (this.get('currentProvider') == true) {
                this.dispatcher.trigger(this.dispatcher.Events.ON_PROVIDER_CHANGED, {mapProvider: this});
            }
        }
    });
    MapProvider.GOOGLE = 'google';
    MapProvider.BING = 'bing';
    MapProvider.OSM = 'osm';
    return MapProvider;
});
