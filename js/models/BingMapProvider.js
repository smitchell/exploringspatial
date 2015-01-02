define([
    'models/MapProvider',
    'models/MapLayer',
    'collections/MapLayers',
    'leaflet_bing'
], function (MapProvider, MapLayer, MapLayers) {
    var BingMapProvider = MapProvider.extend({
        defaults: {
            key: 'AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY',
            name: MapProvider.BING,
            currentProvider: false,
            mapLayers: new MapLayers()
        },
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:currentProvider', this.onMapProviderChanged, this);
            var bingLayers = [];
            bingLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                leafletLayer: new L.BingLayer(this.get('key'), {type: 'Road'})
            });
            bingLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                leafletLayer: new L.BingLayer(this.get('key'), {type: 'Aerial'})
            });
            this.get('mapLayers').set(bingLayers);
        }
    });

    return BingMapProvider;
});
