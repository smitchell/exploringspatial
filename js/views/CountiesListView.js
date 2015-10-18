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
        labelLayer: null,

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.collection = args.collection;
            this.render();
        },

        render: function () {
            this.$el.html(this.template({collection: this.collection.toJSON()}));
        },

         onMouseover: function (event) {

        },

        onMouseout: function (event) {

        }

    });
    return CountyListView;
});
