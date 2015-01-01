define([
    'models/MapProvider',
    'models/MapLayer',
    'collections/MapLayers',
    'leaflet_google'
], function (MapProvider, MapLayer, MapLayers) {
    var GoogleMapProvider = MapProvider.extend({
        defaults: {
            name: MapProvider.GOOGLE,
            currentProvider: false,
            mapLayers: new MapLayers()
        },
        initialize: function () {
            var googleLayers = [];
            googleLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                leafletLayer: new L.Google('ROADMAP')
            });
            googleLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                leafletLayer: new L.Google('SATELLITE')
            });
            this.get('mapLayers').set(googleLayers);
        }
    });

    return GoogleMapProvider;
});
