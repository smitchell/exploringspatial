define([
    'underscore',
    'backbone',
    'models/MapProvider',
    'models/MapLayer',
    'text!templates/maps/MapProviderControlsView.html'
], function(_, Backbone, MapProvider, MapLayer, templateHtml) {

    var Events = {
        ON_RESET_MENU: 'ON_RESET_MENU'
    };

    var MapProviderControlsView = Backbone.View.extend({

        events: {
            'click .provider-ctrl-trigger' : 'onToggleSelector',
            'click .item' : 'onProviderClicked',
            'mouseleave .map-menu' : 'onMouseLeave',
            'mouseenter .map-menu' : 'onMouseEnter'
        },

        initialize: function(args) {
            this.mapControls = args.mapControls;
            this.collection = args.collection;
            this.map = args.map;
            this.template = _.template(templateHtml);
            this._lastZIndex = 0;
            this.currentLayer = null;
            this.render();
        },

        render: function() {
            var html = this.template();
            jQuery(this.el).html(html);
        },

        onToggleSelector: function(e) {
            e.preventDefault();
            this.trigger(Events.ON_RESET_MENU);
            var mapMenu = this.$('.map-menu');
            mapMenu.stop(true, true);
            mapMenu.show(); // show selected menu
            var selectMenu = this.$('.map-select-trigger');
            selectMenu.addClass('selected'); // highlight selected button
            selectMenu.find('.arrow-down').addClass('clicked'); // change down arrow to white
        },

        onMouseLeave: function(e) {
            e.preventDefault();
            var _self = this;
            this.$('.provider-menu').stop(true, true).delay(300).slideUp(20, function () {
                _self.trigger(Events.ON_RESET_MENU);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$el.stop(true, true).show();
            this.$('.provider-ctrl-trigger').addClass('selected');
        },

        onProviderClicked: function(e) {
            e.preventDefault();
            var $target = $(e.target);
            if (!$target.hasClass('selected')) {
                var mapControlsDiv = $(this.mapControls);
                mapControlsDiv.find('.map-provider .item').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                mapControlsDiv.find('.provider .map-btn:first-child').html($target.text() + '<span class="arrow-down"></span>');
                var previousProvider = this.collection.getCurrentProvider();
                var previousLayer = null;
                if (previousProvider != null) {
                    previousLayer =  previousProvider.get('mapLayers').getCurrentLayer()
                }
                var currentProvider =  null;
                if ($target.hasClass('map-provider-google')){
                    currentProvider = this.collection.changeCurrentProvider(MapProvider.GOOGLE);
                } else if ($target.hasClass('map-provider-osm')){
                    currentProvider = this.collection.changeCurrentProvider(MapProvider.OSM);
                } else if ($target.hasClass('map-provider-bing')){
                    currentProvider = this.collection.changeCurrentProvider(MapProvider.BING);
                }
                if (currentProvider != null) {
                    var layerType = MapLayer.ROAD;
                    if (previousLayer != null) {
                        layerType = previousLayer.get('type');
                    }
                    var currentLayer = currentProvider.get('mapLayers').changeCurrentLayer(layerType);
                    if (currentLayer != null) {
                        this.addLayer(currentLayer);
                        if (previousLayer != null) {
                            this.removeLayer(previousLayer);
                        }
                    }
                }
            }
        },

        addLayer: function(layer) {
            var leafletLayer = layer.get('leafletLayer');
            if (!this.map.hasLayer(leafletLayer)) {
                this.map.addLayer(leafletLayer);
            }
        },

        removeLayer: function(layer) {
            var leafletLayer = layer.get('leafletLayer');
            if (this.map.hasLayer(leafletLayer)) {
                this.map.removeLayer(leafletLayer);
            }
        }

    });

    MapProviderControlsView.Events = Events;

    return MapProviderControlsView;
});
