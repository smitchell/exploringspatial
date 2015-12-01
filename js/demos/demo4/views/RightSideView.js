define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'views/maps/MapView',
    'views/maps/ActivityMapLayerView',
    'text!demos/demo4/templates/RightSideView.html'
], function ($, _,
             Backbone,
             Activity,
             MapView,
             ActivityMapLayerView,
             templateHtml) {
    var RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.model = new Activity({activityId: 155155867});
            var _this = this;
            this.model.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            this.mapView = new MapView();
            new ActivityMapLayerView({model: this.model, map: this.mapView.getMap()});
        }
    });
    return RightSideView;
});
