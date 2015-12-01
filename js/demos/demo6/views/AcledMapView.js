define([
    'underscore',
    'backbone',
    'leaflet',
    'apps/MapEventDispatcher',
    'models/MapProvider',
    'models/MapLayer',
    'models/BingMapProvider',
    'models/OsmMapProvider',
    'models/GoogleMapProvider',
    'models/Location',
    'collections/MapProviders',
    'demos/demo6/views/AcledSearchView',
    'views/maps/MapZoomControlsView',
    'views/maps/MapProviderControlsView',
    'views/maps/MapTypeControlsView',
    'views/maps/MapOverlayControlsView'
], function (_, Backbone,
             L,
             MapEventDispatcher,
             MapProvider,
             MapLayer,
             BingMapProvider,
             OsmMapProvider,
             GoogleMapProvider,
             Location,
             MapProviders,
             AcledSearchView,
             MapZoomControlsView,
             MapProviderControlsView,
             MapTypeControlsView,
             MapOverlayControlsView) {

    var AcledMapView = Backbone.View.extend({

        initialize: function (args) {
            this.acledSearch = args.acledSearch;
            this.mapContainer = 'map_container';
            this.mapControls = '.map-controls';
            this.mapOptions = {};
            if (typeof args != 'undefined' && typeof args.mapOptions != 'undefined') {
                this.mapOptions = args.mapOptions;
            }
            this.countries = args.countries;

            // Allow caller to override Location default values.
            if (typeof args == 'undefined') {
                this.location = new Location();
            } else {
                if (typeof args.lat != 'undefined' && typeof args.lat != 'undefined') {
                    this.location = new Location({lat: args.lat, lon: args.lat});
                }
                if (typeof args.zoom != 'undefined') {
                    this.location.set({zoom: args.zoom});
                }
            }

            // listen for location changes from the map search view.
            this.location.on('sync', this.syncMapLocation, this);

            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;

            // Define the base tile map providers. These views are wrappers around Leaflet map layer plugins.
            this.collection = new MapProviders([
                new BingMapProvider({dispatcher: this.dispatcher}),
                new GoogleMapProvider({dispatcher: this.dispatcher}),
                new OsmMapProvider({dispatcher: this.dispatcher})
                ]);

            // Pick a default selected map provider to start with.
            var selectedProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
            selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
            this.render();
            // Wire up the view event handlers.
            this.dispatcher.on(this.dispatcher.Events.MENU_STATE_CHANGE, this.closeAllMenus, this);
            this.dispatcher.on(this.dispatcher.Events.PROVIDER_CLICKED, this.onProviderClicked, this);
            this.dispatcher.on(this.dispatcher.Events.TYPE_CLICKED, this.onTypeClicked, this);
            this.dispatcher.on(this.dispatcher.Events.OVERLAY_CLICKED, this.onOverlayClicked, this);
        },

        render: function () {
            // Fetch the selected map provider and set-up the map.
            var selectedProvider = this.collection.getSelectedProvider();
            var baseLayer = selectedProvider.get('mapLayers').getSelectedBaseLayer();
            this.mapOptions.zoomControl = false;
            this.mapOptions.layers = [baseLayer.get('leafletLayer')];
            this.map = L.map(this.mapContainer, this.mapOptions);
            this.syncMapLocation(); // Uses this.location to pan/zoom the map.

            // Set-up the custom map controls
            var mapControlsDiv = $(this.mapControls);
            new AcledSearchView({
                el: $('#searchBox'),
                model: this.acledSearch,
                countries: this.countries,
                location: this.location,
                mapProviders: this.collection,
                dispatcher: this.dispatcher
            });
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
                if (previousProvider.get('name') ==  MapProvider.GOOGLE) {
                    return;
                }
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
            } else if ($target.hasClass('map-provider-osm')){
                if (previousProvider.get('name') ==  MapProvider.OSM) {
                    return;
                }
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.OSM);
            } else if ($target.hasClass('map-provider-bing')){
                if (previousProvider.get('name') ==  MapProvider.BING) {
                    return;
                }
                selectedProvider = this.collection.changeCurrentProvider(MapProvider.BING);
            }
            if (selectedProvider != null) {
                var layerType = MapLayer.ROAD;

                if (this.mapOverlayControlsView.isOverlaySelected(MapLayer.TERRAIN)) {
                    if (selectedProvider.supportsLayerType(MapLayer.TERRAIN)) {
                        layerType = MapLayer.TERRAIN;
                    }
                } else if (this.mapOverlayControlsView.isOverlaySelected(MapLayer.HYBRID)) {
                    if (selectedProvider.supportsLayerType(MapLayer.HYBRID)) {
                        layerType = MapLayer.HYBRID;
                    } else {
                        layerType = MapLayer.SATELLITE;
                    }
                } else if (this.mapTypeControlsView.isTypeSelected(MapLayer.SATELLITE)) {
                    if (selectedProvider.supportsLayerType(MapLayer.SATELLITE)) {
                        layerType = MapLayer.SATELLITE;
                    }
                }

                var baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(layerType);
                this.switchMapLayers(baseLayer, previousLayer);
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
                    if (previousLayer.get('type') ==  MapProvider.ROAD) {
                        return;
                    }
                    baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
                } else {
                    var labelsSelected = $(this.mapControls).find('.map-layer-labels').hasClass('selected');
                    if (previousLayer.get('type') ==  MapProvider.HYBRID) {
                        return;
                    }
                    if (labelsSelected && selectedProvider.supportsLayerType(MapLayer.HYBRID)) {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.HYBRID);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.SATELLITE);
                    }
                }
                this.switchMapLayers(baseLayer, previousLayer);
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
                        if (previousLayer.get('type') ==  MapProvider.TERRAIN) {
                            return;
                        }
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.TERRAIN);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.ROAD);
                    }
                } else if ($target.hasClass('map-layer-labels')) {
                    if ($target.hasClass('selected')) {
                        if (previousLayer.get('type') ==  MapProvider.HYBRID) {
                            return;
                        }
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.HYBRID);
                    } else {
                        baseLayer = selectedProvider.get('mapLayers').changeBaseLayer(MapLayer.SATELLITE);
                    }
                }
                this.switchMapLayers(baseLayer, previousLayer);
            }
        },

        switchMapLayers: function(selectedLayer, previousLayer) {
            var leafletLayer;
            if (typeof selectedLayer != 'undefined' && selectedLayer != null) {
                leafletLayer = selectedLayer.get('leafletLayer');
                if (!this.map.hasLayer(leafletLayer)) {
                    this.map.addLayer(leafletLayer);
                }
                if (typeof previousLayer != 'undefined' && previousLayer != null) {
                    leafletLayer = previousLayer.get('leafletLayer');
                    if (this.map.hasLayer(leafletLayer)) {
                        this.map.removeLayer(leafletLayer);
                    }
                }
            }
        },

        syncMapLocation: function() {
            if (this.location != null) {
                var lat = this.location.get('lat');
                var lon = this.location.get('lon');
                var zoom = 10;
                if (this.location.get('zoom') != null) {
                    zoom = this.location.get('zoom');
                }
                if (lat != null && lon != null) {
                    var center = L.latLng(lat, lon);
                    this.map.setView(center, zoom);
                }
            }
        },

        /**
         * Called from parent views.
         * @returns {*|Array}
         */
        getMap: function() {
            return this.map;
        }
    });

    return AcledMapView;
});
