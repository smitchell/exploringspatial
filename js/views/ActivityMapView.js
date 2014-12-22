define([
    'underscore',
    'backbone',
    'views/MapZoomControlsView',
    'views/MapProviderControlsView',
    'views/MapTypeControlsView',
    'views/MapOverlayControlsView',
    'leaflet',
    'leaflet_google',
    'leaflet_bing',
    'leaflet_osm'
], function(_, Backbone, MapZoomControlsView, MapProviderControlsView, MapTypeControlsView, MapOverlayControlsView) {

    var ActivityMapView = Backbone.View.extend({
        initialize: function(args) {
            this.config = args;
            this.layers = {};
         },

        render: function(args) {
            this.layers.osm = {};
            this.layers.osm.roadLayer = new L.OSM.TileLayer();
            this.layers.google= {};
            this.layers.google.roadLayer = new L.Google('ROADMAP');
            this.layers.google.satelliteLayer = new L.Google('SATELLITE');
            //this.bingLayer = new L.TileLayer.Bing('AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY','Road', {subdomains: ['0', '1', '2', '3', '4']});
            this.map = L.map(this.config.mapContainer, {
                center: [38.856018, -94.800596],
                zoom: 10,
                zoomControl:false,
                layers: [this.layers.google.roadLayer]
            });

            var mapControlsDiv = $(this.config.mapControls);

            new MapZoomControlsView({
                el: mapControlsDiv.find('.map-zoom'),
                map: this.map
            });
            this.mapProviderControlsView = new MapProviderControlsView({
                el: mapControlsDiv.find('.map-provider'),
                map: this.map,
                mapControls: this.config.mapControls,
                layers: this.layers
            });
            this.mapTypeControlsView = new MapTypeControlsView({
                el: mapControlsDiv.find('.map-type'),
                map: this.map
            });
            this.mapOverlayControlsView = new MapOverlayControlsView({
                el: mapControlsDiv.find('.map-layers'),
                map: this.map,
                mapContainer: jQuery('#' + this.config.mapContainer)
            });
            this.mapProviderControlsView.on(MapProviderControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_TYPE_CLICKED, this.onTypeClicked, this);
            this.mapOverlayControlsView.on(MapOverlayControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
        },

        onResetMenu: function() {
            var mapControlsDiv = $(this.config.mapControls);
            mapControlsDiv.find('.map-menu').slideUp(20);
            mapControlsDiv.find('.map-select-trigger').removeClass('selected'); // toggle map type buttons
            mapControlsDiv.find('.map-controls .map-menu').hide(); // hide all other open menus
            mapControlsDiv.find('.map-controls .arrow-down').removeClass('clicked');
        },

        onTypeClicked: function(args) {
            var $target = args.target;
            if (!$target.hasClass('selected')) {
                var mapControlsDiv = $(this.config.mapControls);
                mapControlsDiv.find('.map-type a').removeClass('selected');
                $target.addClass('selected');
            }
        }


    });

    return ActivityMapView;
});
