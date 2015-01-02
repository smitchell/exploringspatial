define([
    'underscore',
    'backbone',
    'models/MapLayer',
    'text!templates/maps/MapOverlayControlsView.html'
], function (_, Backbone, MapLayer, templateHtml) {

    var Events = {
        ON_RESET_MENU: 'ON_RESET_MENU'
    };

    var MapOverlayControlsView = Backbone.View.extend({

        events: {
            'click .overlay-ctrl-trigger': 'onToggleSelector',
            'click .overlay-item': 'onOverlayClicked',
            'mouseleave .map-menu': 'onMouseLeave',
            'mouseenter .map-menu': 'onMouseEnter'
        },

        initialize: function (args) {
            this.collection = args.collection;
            this.template = _.template(templateHtml);
            this.dispatcher = args.dispatcher;
            this.dispatcher.on(this.dispatcher.Events.ON_PROVIDER_CHANGED, this.toggleVisibility, this);
            this.render();
        },

        render: function () {
            var html = this.template();
            jQuery(this.el).html(html);
            this.toggleVisibility();
        },

        toggleVisibility: function () {
            var mapProvider = this.collection.getCurrentProvider();
            if (mapProvider != null) {
                this.$('.overlay-item').parent().hide();
                var $terrain = this.$('.map-layer-terrain');
                if (mapProvider.supportsLayerType(MapLayer.TERRAIN)) {
                    $terrain.parent().show();
                }
                var $labels = this.$('.map-layer-lables');
                if (mapProvider.supportsLayerType(MapLayer.HYBRID)) {
                    $labels.parent().show();
                }
                var $bicycle = this.$('.map-layer-bicycle');
                if (mapProvider.supportsLayerType(MapLayer.TRAILS)) {
                    $bicycle.parent().show();
                }
            }
        },

        onToggleSelector: function (e) {
            e.preventDefault();
            this.trigger(Events.ON_RESET_MENU);
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
                _self.trigger(Events.ON_RESET_MENU);
            });
        },

        onMouseEnter: function (e) {
            e.preventDefault();
            this.$('.overlay-ctrl-trigger').stop(true, true).show();
            this.$('.overlay-ctrl-trigger').addClass('selected');
        },

        onOverlayClicked: function (e) {
            e.preventDefault();
            var $overlay = $(e.target);
            $overlay.toggleClass('selected');
        }
    });

    MapOverlayControlsView.Events = Events;

    return MapOverlayControlsView;
});
