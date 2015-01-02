define([
    'underscore',
    'backbone',
    'text!templates/maps/MapTypeControlsView.html'
], function(_, Backbone, templateHtml) {

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
            this.dispatcher = args.dispatcher;
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function() {
            var html = this.template();
            this.$el.html(html);
        },

        onToggleSelector: function(e) {
            e.preventDefault();
            this.dispatcher.trigger(this.dispatcher.Events.ON_RESET_TYPE_MENU);
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
                _self.dispatcher.trigger(_self.dispatcher.Events.ON_RESET_TYPE_MENU);
            });
        },

        onMouseEnter: function(e) {
            e.preventDefault();
            this.$el.stop(true, true).show();
            this.$('.type-ctrl-trigger').addClass('selected');
        },

        onTypeClicked: function(e) {
            e.preventDefault();
            var $target = $(e.target);
            if (!$target.hasClass('selected')) {
                this.$('a').removeClass('selected'); // otherwise toggle the selected provider
                $target.addClass('selected');
                this.dispatcher.trigger(this.dispatcher.Events.ON_TYPE_CLICKED, {target: $target});
            }
        }

    });

    return MapTypeControlsView;
});
