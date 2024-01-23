define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Activities',
    'views/maps/MapView',
    'demos/demo5/views/ActivitiesMapLayerView',
    'text!demos/demo5/templates/Demo5PageView.html'
], function ($, _,
             Backbone,
             Activities,
             MapView,
             ActivitiesMapLayerView,
             templateHtml) {
    var Demo5PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
        },

        /**
         * Fetch any needed data here.
         */
        fetchData: function() {
            this.collection = new Activities();
            this.collection.url = 'http://data.byteworksinc.com/activities/kc-mitchell';
            var self = this;
            this.collection.fetch({
                success: function () {
                    self.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            this.mapView = new MapView();
            this.activitiesMapLayerView = new ActivitiesMapLayerView({
                collection: this.collection,
                map: this.mapView.getMap(),
                activitySearch: this.mapView.activitySearch
            });
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 10;
            var height = $demoBody.height() - 125;
            $('.detailMap').css({top: '5px', left: '5px', width: width + 'px', height: height + 'px'});
        },

        destroy: function () {
            if (this.activitiesMapLayerView) {
                this.activitiesMapLayerView.destroy();
            }
            if (this.mapView) {
                this.mapView.destroy();
            }
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 5;
        }
    });

    return Demo5PageView;
});
