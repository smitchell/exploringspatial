/**
 * GoogleMapProvider is a Backbone model that extends the MapProvider model.
 * It contains the attributed necessary to support the Leaflet Google plugin.
 * Its main responsibility is initializing the various MapLayer models supported by Google.
 */
"use strict";
define(function(require) {
    var MapProvider             = require('models/MapProvider'),
        MapLayer                = require('models/MapLayer'),
        MapLayers               = require('collections/MapLayers'),
        GoogleLocationService  = require('services/GoogleLocationService'),
        L                       = require('leaflet');
    require('leaflet_google');

    var GoogleMapProvider = MapProvider.extend({

        /**
         * defaults contains properties unique to Google maps.
         */
        defaults: {
            name: MapProvider.GOOGLE,
            isSelected: false,
            mapLayers: new MapLayers()
        },

        /**
         * The initialize function is responsible for initializing the MapLayer models supported by Google.
         * @param args - Contains a reference to the MapEventDispatcher.
         */
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:isSelected', this.onMapProviderChanged, this);
            var googleLayers = [];
            var mapOptions = {};
            if (args.mapOptions) {
                mapOptions = L.extend({}, args.mapOptions, mapOptions);
            }
            googleLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.Google('ROADMAP', mapOptions)
            });
            googleLayers[1] = new MapLayer({
                type: MapLayer.SATELLITE,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.Google('SATELLITE', mapOptions)
            });
            googleLayers[2] = new MapLayer({
                type: MapLayer.HYBRID,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.Google('HYBRID', mapOptions)
            });
            googleLayers[3] = new MapLayer({
                type: MapLayer.TERRAIN,
                isBaseLayer: true,
                dispatcher: this.dispatcher,
                leafletLayer: new L.Google('TERRAIN', mapOptions)
            });
            this.get('mapLayers').set(googleLayers);
        },

        getGeoCoder: function() {
            return new GoogleLocationService();
        }
    });

    return GoogleMapProvider;
});
