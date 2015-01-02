define([
    'underscore',
    'backbone',
    'models/MapProvider',
    'models/MapLayer',
    'text!templates/maps/MapProviderControlsView.html'
], function(_, Backbone, MapProvider, MapLayer, templateHtml) {

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
            this.dispatcher = args.dispatcher;
            this.map = args.map;
            this.template = _.template(templateHtml);
            this._lastZIndex = 0;
            this.currentLayer = null;
            this.render();
        },

        render: function() {
            var html = this.template();
            this.$el.html(html);
        },

        onToggleSelector: function(e) {
            e.preventDefault();
            this.dispatcher.trigger(this.dispatcher.Events.ON_RESET_PROVIDER_MENU);
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
                _self.dispatcher.trigger(_self.dispatcher.Events.ON_RESET_PROVIDER_MENU);
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
                this.$('.item').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                this.dispatcher.trigger(this.dispatcher.Events.ON_PROVIDER_CLICKED, {target: $target});
            }

        }

    });

    return MapProviderControlsView;
});
