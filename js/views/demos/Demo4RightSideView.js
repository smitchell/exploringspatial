define([
    'jquery',
    'underscore',
    'backbone',
    'views/maps/MapView',
    'text!templates/demos/Demo4RightSideView.html'
], function ($, _,
             Backbone,
             MapView,
             templateHtml) {
    var Demo4RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            this.mapView = new MapView();
        }
    });
    return Demo4RightSideView;
});
