define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/demo4/MapZoomControlsView',
    'views/demos/demo4/MapProviderControlsView',
    'views/demos/demo4/MapTypeControlsView',
    'views/demos/demo4/MapOverlayControlsView',
    'text!templates/demos/demo4/Demo4RightSideView.html',
    'leaflet',
    'leaflet_google',
    'leaflet_bing',
    'leaflet_osm'
], function ($, _, Backbone, MapZoomControlsView, MapProviderControlsView, MapTypeControlsView, MapOverlayControlsView, templateHtml) {
    var Demo4RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.mapContainer = 'map_container';
            this.mapControls = '.map-controls';
            this.layers = {};
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            this.layers.osm = {};
            this.layers.osm.roadLayer = new L.OSM.TileLayer();
            this.layers.google= {};
            this.layers.google.roadLayer = new L.Google('ROADMAP');
            this.layers.google.satelliteLayer = new L.Google('SATELLITE');
            this.bingLayer = new L.TileLayer.Bing('AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY','Road', {subdomains: ['0', '1', '2', '3', '4']});
            this.map = L.map(this.mapContainer, {
                center: [38.856018, -94.800596],
                zoom: 10,
                zoomControl:false,
                layers: [this.layers.google.roadLayer]
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
                layers: this.layers
            });
            this.mapTypeControlsView = new MapTypeControlsView({
                el: mapControlsDiv.find('.map-type'),
                map: this.map
            });
            this.mapOverlayControlsView = new MapOverlayControlsView({
                el: mapControlsDiv.find('.map-layers'),
                map: this.map,
                mapContainer: jQuery('#' + this.mapContainer)
            });
            this.mapProviderControlsView.on(MapProviderControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
            this.mapTypeControlsView.on(MapTypeControlsView.Events.ON_TYPE_CLICKED, this.onTypeClicked, this);
            this.mapOverlayControlsView.on(MapOverlayControlsView.Events.ON_RESET_MENU, this.onResetMenu, this);
        },

        onResetMenu: function() {
            var mapControlsDiv = $(this.mapControls);
            mapControlsDiv.find('.map-menu').slideUp(20);
            mapControlsDiv.find('.map-select-trigger').removeClass('selected'); // toggle map type buttons
            mapControlsDiv.find('.map-controls .map-menu').hide(); // hide all other open menus
            mapControlsDiv.find('.map-controls .arrow-down').removeClass('clicked');
        },

        onTypeClicked: function(args) {
            var $target = args.target;
            if (!$target.hasClass('selected')) {
                var mapControlsDiv = $(this.mapControls);
                mapControlsDiv.find('.map-type a').removeClass('selected');
                $target.addClass('selected');
            }
        }
    });
    return Demo4RightSideView;
});
