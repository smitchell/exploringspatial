/**
 * The purpose of the CountiesListView is render feature collection GeoJson as a list.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/CountiesListView.html'
], function ($, _, Backbone, templateHtml) {

    var CountiesListView = Backbone.View.extend({

        events: {
          "mouseenter .county-name"   : "onMouseover",
          "mouseleave .county-name"   : "onMouseout"
        },

        highlightClass: 'highlighted',
        labelLayer: null,

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.collection = args.collection;
            this.dispatcher = args.dispatcher;
            this.render();
            this.dispatcher.on(this.dispatcher.Events.LAYER_MOUSEOVER, this.onLayerMouseover, this);
            this.dispatcher.on(this.dispatcher.Events.LAYER_MOUSEOUT, this.onLayerMouseout, this);
        },

        render: function () {
            this.$el.html(this.template({collection: this.collection.toJSON()}));
        },

        onLayerMouseover: function(args) {
            var geoid = args.geoid;
            this.$('.county-name').removeClass(this.highlightClass);
            if (geoid) {
                var el = this.$('#' + geoid);
                el.addClass(this.highlightClass);
                this.scrollToElement(el[0]);
            }
        },

        onLayerMouseout: function(args) {
            this.$('.county-name').removeClass(this.highlightClass);
        },

        onMouseover: function (event) {
            $(event.currentTarget).addClass(this.highlightClass);
            this.dispatcher.trigger(this.dispatcher.Events.LIST_MOUSEOVER, {geoid: $(event.currentTarget).attr('id')});
        },

        onMouseout: function (event) {
            $(event.currentTarget).removeClass(this.highlightClass);
            this.dispatcher.trigger(this.dispatcher.Events.LIST_MOUSEOUT, {geoid: $(event.currentTarget).attr('id')});
        },

        scrollToElement: function(elem) {
            var top = this.$el.scrollTop();
            var bottom = top + this.$el.height();
            var offsetTop = elem.offsetTop - this.$el[0].offsetTop;
            if (offsetTop > bottom || offsetTop < top) {
                this.$el.scrollTop(offsetTop);
            }
        }

    });
    return CountiesListView;
});
