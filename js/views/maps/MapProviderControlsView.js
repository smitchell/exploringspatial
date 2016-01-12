/**
 * The purpose of the MapProviderControlsView is to control user interaction with the map provider dropdown menu.
 */
define([
    'underscore',
    'backbone',
    'models/MapProvider',
    'models/MapLayer',
    'text!templates/maps/MapProviderControlsView.html'
], function(_, Backbone, MapProvider, MapLayer, templateHtml) {

    var MapProviderControlsView = Backbone.View.extend({

        events: {
            'click .provider-ctrl-trigger' : 'onToggleSelected',
            'click .item' : 'onProviderClicked',
            'mouseleave .map-menu' : 'onMouseLeave',
            'mouseenter .map-menu' : 'onMouseEnter'
        },

        initialize: function(args) {
            this.dispatcher = args.dispatcher;
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function() {
            var html = this.template();
            this.$el.html(html);
        },

        /**
         * The purpose of the onToggleSelected function is to first collapse any other
         * open menus by calling MENU_STATE_CHANGE, and then expand the .map-menu div.
         * @param e - The click event.
         */
        onToggleSelected: function(e) {
            e.preventDefault();
            this.dispatcher.trigger(this.dispatcher.Events.MENU_STATE_CHANGE, {type: this.dispatcher.Events.MENU_STATE_CHANGE});
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
                _self.dispatcher.trigger(_self.dispatcher.Events.MENU_STATE_CHANGE);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$el.stop(true, true).show();
            this.$('.provider-ctrl-trigger').addClass('selected');
        },

        /**
         * The purpose of this function is to toggle the selected class on the menu item clicked,
         * and then trigger PROVIDER_CLICKED to change the map provider.
         * @param e - The click event.
         */
        onProviderClicked: function(e) {
            e.preventDefault();
            var $target = $(e.target);
            if (!$target.hasClass('selected')) {
                this.$('.item').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                this.dispatcher.trigger(this.dispatcher.Events.PROVIDER_CLICKED, {
                    type: this.dispatcher.Events.PROVIDER_CLICKED,
                    target: $target
                });
            }

        }

    });

    return MapProviderControlsView;
});
