define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'views/maps/MapView',
    'views/maps/ActivityMapLayerView',
    'text!demos/demo4/templates/Demo4PageView.html'
], function ($, _,
             Backbone,
             Activity,
             MapView,
             ActivityMapLayerView,
             templateHtml) {
    var Demo4PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
        },

        /**
         * Fetch any needed data here.
         */
        render: function() {
            this.model = new Activity({activityId: 155155867});
            var _this = this;
            this.model.onFetchComplete({
                success: function () {
                    _this.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        onFetchComplete: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            this.mapView = new MapView();
            new ActivityMapLayerView({model: this.model, map: this.mapView.getMap()});
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 28;
            var height = $demoBody.height() - 40;
            $('.detailMap').css({top: '5px', left: '5px', width: width + 'px', height: height + 'px'});
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 4;
        }
    });

    return Demo4PageView;
});
