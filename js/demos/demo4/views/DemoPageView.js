define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'views/maps/MapView',
    'views/maps/ActivityMapLayerView',
    'text!demos/demo4/templates/DemoPageView.html'
], function ($, _,
             Backbone,
             Activity,
             MapView,
             ActivityMapLayerView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.model = new Activity({activityId: 155155867});
            var _this = this;
            this.model.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            this.mapView = new MapView();
            new ActivityMapLayerView({model: this.model, map: this.mapView.getMap()});
        },

        sizeMaps: function() {
            var $container3 = $('#container3');
            var width = $container3.width() - 28;
            var height = $container3.height() - 40;
            $('#map_container').css({top: '5px',left: '5px', width: width + 'px', height: height + 'px'});
        }
    });
    return DemoPageView;
});
