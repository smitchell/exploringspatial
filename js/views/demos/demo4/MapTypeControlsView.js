define([
    'underscore',
    'backbone',
    'text!templates/demos/demo4/MapTypeControlsView.html'
], function(_, Backbone, templateHtml) {

    var Events = {
        ON_RESET_MENU: 'ON_RESET_MENU',
        ON_TYPE_CLICKED: 'ON_TYPE_CLICKED'
    };


    var MapTypeControlsView = Backbone.View.extend({

        events: {
            'click .type-ctrl-trigger' : 'onToggleSelector',
            'click .map-type-map' : 'onTypeClicked',
            'click .map-type-satellite' : 'onTypeClicked',
            'mouseleave .map-menu' : 'onMouseLeave',
            'mouseenter .map-menu' : 'onMouseEnter'
        },


        initialize: function(args) {
            this.map = args.map;
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
            this.$('.type-menu').stop(true, true).delay(300).slideUp(20, function () {
                _self.trigger(Events.ON_RESET_MENU);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$el.stop(true, true).show();
            this.$('.type-ctrl-trigger').addClass('selected');
        },

        onTypeClicked: function(e) {
            e.preventDefault();
            var $mapType = $(e.target);
            this.trigger(Events.ON_TYPE_CLICKED, {target: $mapType});
        }

    });

    MapTypeControlsView.Events = Events;

    return MapTypeControlsView;
});
