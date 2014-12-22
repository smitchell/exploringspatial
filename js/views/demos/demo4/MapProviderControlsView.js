define([
    'underscore',
    'backbone',
    'text!templates/demos/demo4/MapProviderControlsView.html'
], function(_, Backbone, templateHtml) {

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
            this.config = args;
            this.template = _.template(templateHtml);
            this._layers = {};
            this._lastZIndex = 0;
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
                var mapControlsDiv = $(this.config.mapControls);
                mapControlsDiv.find('.map-provider .item').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                mapControlsDiv.find('.provider .map-btn:first-child').html($target.text() + '<span class="arrow-down"></span>');
                if ($target.hasClass('map-provider-google')){
                    this.addLayer(this.config.layers.google.roadLayer);
                    this.removeLayer(this.config.layers.osm.roadLayer);
                } else if ($target.hasClass('map-provider-osm')){
                    this.addLayer(this.config.layers.osm.roadLayer);
                    this.removeLayer(this.config.layers.google.roadLayer);
                }
                else if ($target.hasClass('map-provider-bing')){

                }
            }
        },

        addLayer: function(layer) {
            if (!this.config.map.hasLayer(layer)) {
                this.config.map.addLayer(layer);
            }
        },

        removeLayer: function(layer) {
            if (this.config.map.hasLayer(layer)) {
                this.config.map.removeLayer(layer);
            }
        }

    });

    MapProviderControlsView.Events = Events;

    return MapProviderControlsView;
});
