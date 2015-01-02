/**
 * The purpose of the MapOverlayControlsView is to control user interaction with the map overlays dropdown menu.
 */
define([
    'underscore',
    'backbone',
    'models/MapLayer',
    'text!templates/maps/MapOverlayControlsView.html'
], function (_, Backbone, MapLayer, templateHtml) {

    var MapOverlayControlsView = Backbone.View.extend({

        events: {
            'click .overlay-ctrl-trigger': 'onToggleSelected',
            'click .overlay-item': 'onOverlayClicked',
            'mouseleave .map-menu': 'onMouseLeave',
            'mouseenter .map-menu': 'onMouseEnter'
        },

        initialize: function (args) {
            this.collection = args.collection;
            this.template = _.template(templateHtml);
            this.dispatcher = args.dispatcher;
            this.dispatcher.on(this.dispatcher.Events.ON_PROVIDER_CHANGED, this.toggleVisibility, this);
            this.dispatcher.on(this.dispatcher.Events.ON_BASE_LAYER_CHANGED, this.toggleVisibility, this);
            this.render();
        },

        render: function () {
            var html = this.template();
            jQuery(this.el).html(html);
            this.toggleVisibility();
        },

        /**
         * The purpose of this function is to show or hide overlay options
         * depending on what the map provider supports.
         */
        toggleVisibility: function () {
            var mapProvider = this.collection.getSelectedProvider();
            if (mapProvider != null) {
                var mapLayer = mapProvider.get('mapLayers').getSelectedBaseLayer();
                if (mapLayer != null) {
                    var $terrain = this.$('.map-layer-terrain');
                    var $labels = this.$('.map-layer-labels');
                    this.$('.overlay-item').parent().hide();
                    if (mapProvider.supportsLayerType(MapLayer.TERRAIN)) {
                        var isSatelliteSelected = mapLayer.get('type') == MapLayer.SATELLITE;
                        var isHybridSelected = mapLayer.get('type') == MapLayer.HYBRID;
                        var supportsHybrid = mapProvider.supportsLayerType(MapLayer.HYBRID);
                        if ((isSatelliteSelected || isHybridSelected) && supportsHybrid) {
                            $labels.parent().show()
                        } else {
                            $terrain.parent().show();
                        }
                    }


                    var $bicycle = this.$('.map-layer-bicycle');
                    if (mapProvider.supportsLayerType(MapLayer.TRAILS)) {
                        $bicycle.parent().show();
                    }
                }
            }
        },

        /**
         * The purpose of the onToggleSelected function is to first collapse any other
         * open menus by calling ON_MENU_STATE_CHANGE, and then expand the .map-menu div.
         * @param e - The click event.
         */
        onToggleSelected: function (e) {
            e.preventDefault();
            this.dispatcher.trigger(this.dispatcher.Events.ON_MENU_STATE_CHANGE);
            var mapMenu = this.$('.map-menu');
            mapMenu.stop(true, true);
            mapMenu.show(); // show selected menu
            var selectMenu = this.$('.map-select-trigger');
            selectMenu.addClass('selected'); // highlight selected button
            selectMenu.find('.arrow-down').addClass('clicked'); // change down arrow to white
        },

        onMouseLeave: function (e) {
            e.preventDefault();
            var _self = this;
            this.$('.overlay-menu').stop(true, true).delay(300).slideUp(20, function () {
                _self.dispatcher.trigger(_self.dispatcher.Events.ON_MENU_STATE_CHANGE);
            });
        },

        onMouseEnter: function (e) {
            e.preventDefault();
            this.$('.overlay-ctrl-trigger').stop(true, true).show();
            this.$('.overlay-ctrl-trigger').addClass('selected');
        },

        /**
         * The purpose of this function is to toggle the selected class on the menu item clicked,
         * and then trigger ON_OVERLAY_CLICKED to change the map layer.
         * @param e - The click event.
         */
        onOverlayClicked: function (e) {
            e.preventDefault();
            var $overlay = $(e.target);
            $overlay.toggleClass('selected');
            this.dispatcher.trigger(this.dispatcher.Events.ON_OVERLAY_CLICKED, {target: $overlay});
        }
    });

    return MapOverlayControlsView;
});
