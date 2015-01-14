define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'views/maps/MapView',
    'views/maps/ActivityMapLayerView',
    'text!templates/demos/Demo4RightSideView.html'
], function ($, _,
             Backbone,
             Activity,
             MapView,
             ActivityMapLayerView,
             templateHtml) {
    var Demo4RightSideView = Backbone.View.extend({
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
            var props = this.model.get('properties');
            var args = {
                lat: (props.get('minLat') + props.get('maxLat')) / 2,
                lon: (props.get('minLon') + props.get('maxLon')) / 2
            }
            this.mapView = new MapView();
            new ActivityMapLayerView({model: this.model, map: this.mapView.getMap()});
        }
    });
    return Demo4RightSideView;
});
