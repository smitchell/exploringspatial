define([
    'models/MapProvider',
    'models/MapLayer',
    'collections/MapLayers',
    'leaflet'
], function (MapProvider, MapLayer, MapLayers) {
    var OsmMapProvider = MapProvider.extend({
        defaults: {
            name: MapProvider.OSM,
            currentProvider: false,
            mapLayers: new MapLayers(),
            roadAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            satelliteAttribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
            'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
        },
        initialize: function () {
            var osmLayers = [];
            osmLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                leafletLayer: new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: this.get('roadAttribution')
                })
            });
            osmLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                leafletLayer: new L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
                    attribution: this.get('satelliteAttribution'),
                    subdomains: '1234'
                })
            });
            this.get('mapLayers').set(osmLayers);
        }
    });

    return OsmMapProvider;
});
