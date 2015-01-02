define([
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'models/MapProvider',
    'models/MapLayer',
    'models/BingMapProvider',
    'models/OsmMapProvider',
    'models/GoogleMapProvider',
    'collections/MapProviders',
    'views/maps/MapZoomControlsView',
    'views/maps/MapProviderControlsView',
    'views/maps/MapTypeControlsView',
    'views/maps/MapOverlayControlsView'
], function (_, Backbone,
             MapEventDispatcher,
             MapProvider,
             MapLayer,
             BingMapProvider,
             OsmMapProvider,
             GoogleMapProvider,
             MapProviders,
             MapZoomControlsView,
             MapProviderControlsView,
             MapTypeControlsView,
             MapOverlayControlsView) {

    var MapView = Backbone.View.extend({

        initialize: function (args) {
            this.args = args;
            this.mapContainer = 'map_container';
            this.mapControls = '.map-controls';
            this.mapOptions = args.mapOptions;
            this.dispatcher = MapEventDispatcher;
            this.collection = new MapProviders([
                new BingMapProvider({dispatcher: this.dispatcher}),
                new GoogleMapProvider({dispatcher: this.dispatcher}),
                new OsmMapProvider({dispatcher: this.dispatcher})
                ]);

            var selectedProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
            selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
            this.render();
        },

        render: function () {
            var selectedProvider = this.collection.getSelectedProvider();
            var baseLayer = selectedProvider.get('mapLayers').getSelectedBaseLayer();
            this.mapOptions.zoomControl = false;
            this.mapOptions.layers = [baseLayer.get('leafletLayer')];
            this.map = L.map(this.mapContainer, this.mapOptions);
            var mapControlsDiv = $(this.mapControls);

            new MapZoomControlsView({
                el: mapControlsDiv.find('.map-zoom'),
                map: this.map
            });
            this.mapProviderControlsView = new MapProviderControlsView({
                el: mapControlsDiv.find('.map-provider'),
                dispatcher: this.dispatcher
            });
            this.mapTypeControlsView = new MapTypeControlsView({
                el: mapControlsDiv.find('.map-type'),
                dispatcher: this.dispatcher
            });
            this.mapOverlayControlsView = new MapOverlayControlsView({
                el: mapControlsDiv.find('.map-layers'),
                collection: this.collection,
                dispatcher: this.dispatcher
            });
            this.dispatcher.on(this.dispatcher.Events.ON_MENU_STATE_CHANGE, this.closeAllMenus, this);
            this.dispatcher.on(this.dispatcher.Events.ON_PROVIDER_CLICKED, this.onProviderClicked, this);
            this.dispatcher.on(this.dispatcher.Events.ON_TYPE_CLICKED, this.onTypeClicked, this);
            this.dispatcher.on(this.dispatcher.Events.ON_OVERLAY_CLICKED, this.onOverlayClicked, this);
        },

        /**
         * The purpose of this method is to close all menus.
         * Triggered from clicking on a menu (to close the other menus),
         * or by leaving an open menus
         */
        closeAllMenus: function () {
            var mapControlsDiv = $(this.mapControls);
            mapControlsDiv.find('.map-menu').slideUp(20);
            mapControlsDiv.find('.map-select-trigger').removeClass('selected'); // toggle map type buttons
            mapControlsDiv.find('.map-controls .map-menu').hide(); // hide all other open menus
            mapControlsDiv.find('.map-controls .arrow-down').removeClass('clicked');
        },

        /**
         * The purpose of this function is change the base map provider (e.g. Google, OSM, Bing)
         * @param args - Contains the target of the click event.
         */
        onProviderClicked: function(args) {
            var $target = args.target;
            var mapControlsDiv = $(this.mapControls);
            mapControlsDiv.find('.provider .map-btn:first-child').html($target.text() + '<span class="arrow-down"></span>');
            var previousProvider = this.collection.getSelectedProvider();
            var previousLayer = null;
            if (previousProvider != null) {
                previousLayer =  previousProvider.get('mapLayers').getSelectedBaseLayer()
            }
            var selectedProvider =  null;
            if ($target.hasClass('map-provider-google')){
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
            } else if ($target.hasClass('map-provider-osm')){
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.OSM);
            } else if ($target.hasClass('map-provider-bing')){
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.BING);
            }
            if (selectedProvider != null) {
                var layerType = MapLayer.ROAD;
                if (previousLayer != null) {
                    layerType = previousLayer.get('type');
                    // Preserve type or overlay if supported by the new map provider.
                    if (!selectedProvider.supportsLayerType(layerType)) {
                        layerType = MapLayer.ROAD;
                    }
                }
                var baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(layerType);
                if (baseLayer != null) {
                    this.addLayer(baseLayer);
                    if (previousLayer != null) {
                        this.removeLayer(previousLayer);
                    }
                }
            }
        },

        /**
         * The purpose of this function is the change the map layer (road or satellite).
         * @param args - Contains the target of the click event.
         */
        onTypeClicked: function (args) {
            var $target = args.target;
            var selectedProvider = this.collection.getSelectedProvider();
            var previousLayer = selectedProvider.get('mapLayers').getSelectedBaseLayer();
            if (selectedProvider != null) {
                var baseLayer = null;
                if ($target.hasClass('map-type-map')) {
                    baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
                } else {
                    var labelsSelected = $(this.mapControls).find('.map-layer-labels').hasClass('selected');
                    if (labelsSelected && selectedProvider.supportsLayerType(MapLayer.HYBRID)) {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.HYBRID);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.SATELLITE);
                    }
                }
                if (baseLayer != null) {
                    this.addLayer(baseLayer);
                    if (previousLayer != null) {
                        this.removeLayer(previousLayer);
                    }
                }
            }
        },

        /**
         * The purpose of this function is the change the overlay (e.g. from satellite to hybrid, or togget he bicycle layer).
         * @param args - Contains the target of the click event.
         */
        onOverlayClicked: function(args) {
            var $target = args.target;
            var selectedProvider = this.collection.getSelectedProvider();
            var previousLayer = selectedProvider.get('mapLayers').getSelectedBaseLayer();
            if (selectedProvider != null) {
                var baseLayer = null;
                if ($target.hasClass('map-layer-terrain')) {
                    if ($target.hasClass('selected')) {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.TERRAIN);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
                    }
                } else if ($target.hasClass('map-layer-labels')) {
                    if ($target.hasClass('selected')) {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.HYBRID);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.SATELLITE);
                    }
                }
                if (baseLayer != null) {
                    this.addLayer(baseLayer);
                    if (previousLayer != null) {
                        this.removeLayer(previousLayer);
                    }
                }
            }
        },

        addLayer: function (layer) {
            var leafletLayer = layer.get('leafletLayer');
            if (!this.map.hasLayer(leafletLayer)) {
                this.map.addLayer(leafletLayer);
            }
        },

        removeLayer: function (layer) {
            var leafletLayer = layer.get('leafletLayer');
            if (this.map.hasLayer(leafletLayer)) {
                this.map.removeLayer(leafletLayer);
            }
        }
    });

    return MapView;
});
