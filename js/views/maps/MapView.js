define([
    'underscore',
    'backbone',
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
            this.collection = new MapProviders(
                [
                    new BingMapProvider(),
                    new GoogleMapProvider(),
                    new OsmMapProvider()
                ]
            );
            var currentProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
            currentProvider.get('mapLayers').changeCurrentLayer(MapLayer.ROAD);
            this.render();
        },

        render: function () {
            var currentProvider = this.collection.getCurrentProvider();
            var currentLayer = currentProvider.get('mapLayers').getCurrentLayer();
            this.map = L.map(this.mapContainer, {
                center: [38.856018, -94.800596],
                zoom: 10,
                zoomControl: false,
                layers: [currentLayer.get('leafletLayer')]
            });
            var mapControlsDiv = $(this.mapControls);

            new MapZoomControlsView({
                el: mapControlsDiv.find('.map-zoom'),
                map: this.map
            });
            this.mapProviderControlsView = new MapProviderControlsView({
                el: mapControlsDiv.find('.map-provider'),
                map: this.map,
                mapControls: this.mapControls,
                collection: this.collection
            });
            this.mapTypeControlsView = new MapTypeControlsView({
                el: mapControlsDiv.find('.map-type'),
                map: this.map,
                collection: this.collection
            });
            this.mapOverlayControlsView = new MapOverlayControlsView({
                el: mapControlsDiv.find('.map-layers'),
                map: this.map,
                collection: this.collection,
                mapContainer: jQuery('#' + this.mapContainer)
            });
            this.mapProviderControlsView.on(MapProviderControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_TYPE_CLICKED, this.onTypeClicked, this);
            this.mapOverlayControlsView.on(MapOverlayControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
        },

        onResetMenu: function () {
            var mapControlsDiv = $(this.mapControls);
            mapControlsDiv.find('.map-menu').slideUp(20);
            mapControlsDiv.find('.map-select-trigger').removeClass('selected'); // toggle map type buttons
            mapControlsDiv.find('.map-controls .map-menu').hide(); // hide all other open menus
            mapControlsDiv.find('.map-controls .arrow-down').removeClass('clicked');
        },

        onTypeClicked: function (args) {
            var $target = args.target;
            if (!$target.hasClass('selected')) {
                var mapControlsDiv = $(this.mapControls);
                mapControlsDiv.find('.map-type a').removeClass('selected');
                $target.addClass('selected');
                var currentProvider = this.collection.getCurrentProvider();
                var previousLayer = currentProvider.get('mapLayers').getCurrentLayer();
                if (currentProvider != null) {
                    var currentLayer = null;
                    if ($target.hasClass('map-type-map')) {
                        currentLayer = currentProvider.get('mapLayers').changeCurrentLayer(MapLayer.ROAD);
                    } else {
                        currentLayer = currentProvider.get('mapLayers').changeCurrentLayer(MapLayer.SATELLITE);
                    }
                    if (currentLayer != null) {
                        this.addLayer(currentLayer);
                        if (previousLayer != null) {
                            this.removeLayer(previousLayer);
                        }
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
