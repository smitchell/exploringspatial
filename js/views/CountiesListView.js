/**
 * The purpose of the CountyListView is render feature collection GeoJson as a list.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/CountiesListView.html'
], function ($, _, Backbone, templateHtml) {

    var CountyListView = Backbone.View.extend({

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
        },

        render: function () {
            this.$el.html(this.template({collection: this.collection.toJSON()}));
            this.dispatcher.on(this.dispatcher.Events.ON_LAYER_MOUSEOVER, this.onLayerMouseover, this);
            this.dispatcher.on(this.dispatcher.Events.ON_LAYER_MOUSEOUT, this.onLayerMouseout, this);
        },

        onLayerMouseover: function(args) {

            var geoid = args.geoid;
            this.$('.county-name').removeClass(this.highlightClass);
            if (geoid) {
                this.$('#' + geoid).addClass(this.highlightClass);
            }
        },

        onLayerMouseout: function(args) {
            this.$('.county-name').removeClass(this.highlightClass);
        },

        onMouseover: function (event) {
            $(event.currentTarget).addClass(this.highlightClass);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LIST_MOUSEOVER, {geoid: $(event.currentTarget).attr('id')});
        },

        onMouseout: function (event) {
            $(event.currentTarget).removeClass(this.highlightClass);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LIST_MOUSEOUT, {geoid: $(event.currentTarget).attr('id')});
        }

    });
    return CountyListView;
});
