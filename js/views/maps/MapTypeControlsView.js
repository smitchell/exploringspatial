/**
 * The purpose of the MapTypeControlsView is to control user interaction with the map type dropdown menu.
 */
define([
    'underscore',
    'backbone',
    'models/MapLayer',
    'text!templates/maps/MapTypeControlsView.html'
], function(_, Backbone, MapLayer, templateHtml) {

    var MapTypeControlsView = Backbone.View.extend({

        events: {
            'click .type-ctrl-trigger' : 'onToggleSelected',
            'click .map-type-map' : 'onTypeClicked',
            'click .map-type-satellite' : 'onTypeClicked',
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

        isTypeSelected: function(overlayType) {
            var result;
            switch(overlayType) {
                case MapLayer.SATELLITE: {
                    result = this.$('.map-type-satellite').hasClass('selected');
                    break;
                }
                case MapLayer.ROAD: {
                    result = this.$('.map-type-map').hasClass('selected');
                    break;
                }
                default:
                {
                    result = false;
                    break;
                }
            }
            return result;
        },

        /**
         * The purpose of the onToggleSelected function is to first collapse any other
         * open menus by calling MENU_STATE_CHANGE, and then expand the .map-menu div.
         * @param e - The click event.
         */
        onToggleSelected: function(e) {
            e.preventDefault();
            this.dispatcher.trigger(this.dispatcher.Events.MENU_STATE_CHANGE);
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
            this.$('.type-menu').stop(true, true).delay(300).slideUp(20, function () {
                _self.dispatcher.trigger(_self.dispatcher.Events.MENU_STATE_CHANGE);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$el.stop(true, true).show();
            this.$('.type-ctrl-trigger').addClass('selected');
        },

        /**
         * The purpose of this function is to toggle the selected class on the menu item clicked,
         * and then trigger TYPE_CLICKED to change the map layer.
         * @param e - The click event.
         */
        onTypeClicked: function(e) {
            e.preventDefault();
            var $target = $(e.target);
            if (!$target.hasClass('selected')) {
                this.$('a').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                this.dispatcher.trigger(this.dispatcher.Events.TYPE_CLICKED, {target: $target});
            }
        }

    });

    return MapTypeControlsView;
});
