define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Activities',
    'views/maps/MapView',
    'views/maps/ActivitiesMapLayerView',
    'text!templates/demos/Demo5RightSideView.html'
], function ($, _,
             Backbone,
             Activities,
             MapView,
             ActivitiesMapLayerView,
             templateHtml) {
    var Demo5RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.collection = new Activities();
            var _this = this;
            this.collection.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            this.mapView = new MapView();
            new ActivitiesMapLayerView({collection: this.collection, map: this.mapView.getMap(), activitySearch: this.mapView.activitySearch});
        }
    });
    return Demo5RightSideView;
});
