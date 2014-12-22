define([
    'underscore',
    'backbone',
    'text!templates/demos/demo4/MapOverlayControlsView.html'
], function(_, Backbone, templateHtml) {

    var Events = {
        ON_RESET_MENU: 'ON_RESET_MENU'
    };

    var MapOverlayControlsView = Backbone.View.extend({

        events: {
            'click .overlay-ctrl-trigger' : 'onToggleSelector',
            'click .overlay-item' : 'onOverlayClicked',
            'mouseleave .map-menu' : 'onMouseLeave',
            'mouseenter .map-menu' : 'onMouseEnter'
        },

        initialize: function(args) {
            this.map = args.map;
            this.mapContainer = args.mapContainer;
            this.template = _.template(templateHtml);
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
            this.$('.overlay-menu').stop(true, true).delay(300).slideUp(20, function () {
                _self.trigger(Events.ON_RESET_MENU);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$('.overlay-ctrl-trigger').stop(true, true).show();
            this.$('.overlay-ctrl-trigger').addClass('selected');
        },

        onOverlayClicked: function(e) {
            e.preventDefault();
            var $overlay = $(e.target);
            $overlay.toggleClass('selected');
        }
    });

    MapOverlayControlsView.Events = Events;

    return MapOverlayControlsView;
});
