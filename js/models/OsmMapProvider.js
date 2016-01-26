/**
 * OsmMapProvider is a Backbone model that extends the MapProvider model.
 * It contains the attributed necessary to support the Leaflet OSM plugin.
 * Its main responsibility is initializing the various MapLayer models supported by OSM.
 */
define(function(require) {
    "use strict";
    var MapProvider              = require('models/MapProvider'),
        MapLayer                 = require('models/MapLayer'),
        MapLayers                = require('collections/MapLayers'),
        MapQuestLocationService = require('services/MapQuestLocationService'),
        L                        = require('leaflet');

    var OsmMapProvider = MapProvider.extend({

        /**
         * defaults contains properties unique to OSM maps.
         */
        defaults: {
            name: MapProvider.OSM,
            isSelected: false,
            mapLayers: new MapLayers(),
            roadAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            satelliteAttribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
            'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
        },

        /**
         * The initialize function is responsible for initializing the MapLayer models supported by OSM.
         * @param args - Contains a reference to the MapEventDispatcher.
         */
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:isSelected', this.onMapProviderChanged, this);
            var osmLayers = [];
            var roadOptions = {attribution: this.get('roadAttribution')};
            var satelliteOptions = {
                attribution: this.get('satelliteAttribution'),
                subdomains: '1234'
            };
            if (args.mapOptions) {
                roadOptions = L.extend({}, args.mapOptions, roadOptions);
                satelliteOptions = L.extend({}, args.mapOptions, satelliteOptions);
            }
            osmLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', roadOptions)
            });
            osmLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', satelliteOptions)
            });
            this.get('mapLayers').set(osmLayers);
        },

        getGeoCoder: function() {
            return new MapQuestLocationService();
        }
    });

    return OsmMapProvider;
});
