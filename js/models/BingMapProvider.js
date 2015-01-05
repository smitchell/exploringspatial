/**
 * BingMapProvider is a Backbone model that extends the MapProvider model.
 * It contains the attributed necessary to support the Leaflet Bing plugin.
 * Its main responsibility is initializing the various MapLayer models supported by Bing.
 */
define([
    'models/MapProvider',
    'models/MapLayer',
    'collections/MapLayers',
    'leaflet_bing'
], function (MapProvider, MapLayer, MapLayers) {
    var BingMapProvider = MapProvider.extend({

        /**
         * defaults contains properties unique to Bing maps.
         */
        defaults: {
            key: 'AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY',
            name: MapProvider.BING,
            isSelected: false,
            mapLayers: new MapLayers()
        },

        /**
         * The initialize function is responsible for initializing the MapLayer models supported by Bing.
         * @param args - Contains a reference to the MapEventDispatcher.
         */
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:isSelected', this.onMapProviderChanged, this);
            var bingLayers = [];
            var roadOptions = {type: 'Road'};
            var satelliteOptions = {type: 'Aerial'};
            if (args.mapOptions) {
                roadOptions = L.extend({}, args.mapOptions, roadOptions);
                satelliteOptions = L.extend({}, args.mapOptions, satelliteOptions);
            }
            bingLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.BingLayer(this.get('key'), roadOptions)
            });
            bingLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.BingLayer(this.get('key'), satelliteOptions)
            });
            this.get('mapLayers').set(bingLayers);
        }
    });

    return BingMapProvider;
});
