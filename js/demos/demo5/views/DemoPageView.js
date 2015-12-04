define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Activities',
    'views/maps/MapView',
    'demos/demo5/views/ActivitiesMapLayerView',
    'text!demos/demo5/templates/DemoPageView.html'
], function ($, _,
             Backbone,
             Activities,
             MapView,
             ActivitiesMapLayerView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.collection = new Activities();
            this.collection.url = 'http://data.exploringspatial.com/activities/kc-mitchell';
            var _this = this;
            this.collection.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            this.mapView = new MapView();
            new ActivitiesMapLayerView({collection: this.collection, map: this.mapView.getMap(), activitySearch: this.mapView.activitySearch});
        },

        sizeMaps: function() {
            var $container3 = $('#container3');
            var width = $container3.width() - 28;
            var height = $container3.height() - 140;
            $('#map_container').css({top: '5px',left: '5px', width: width + 'px', height: height + 'px'});
        }
    });

    return DemoPageView;
});
