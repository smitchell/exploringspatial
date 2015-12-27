define([
    'jquery',
    'underscore',
    'backbone',
    'demos/demo6/models/AcledSearch',
    'demos/demo6/collections/CodeDefinitions',
    'demos/demo6/views/AcledMapView',
    'demos/demo6/views/ArmedConflictLocationsView',
    'text!demos/demo6/templates/Demo6PageView.html'
], function ($, _,
             Backbone,
             AcledSearch,
             CodeDefinitions,
             AcledMapView,
             ArmedConflictLocationsView,
             templateHtml) {
    var Demo6PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
        },

        fetchData: function() {
            this.collection = new CodeDefinitions("COUNTRY");
            var _this = this;
            this.collection.fetch({
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

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            var acledSearch = new AcledSearch();
            this.mapView = new AcledMapView({
                acledSearch: acledSearch,
                countries: this.collection,
                lat: 1.5818302639606454,
                lon: 16.787109375,
                zoom: 3
            });
            this.armedConflictLocationsView = new ArmedConflictLocationsView({
                acledSearch: acledSearch,
                collection: this.collection,
                map: this.mapView.getMap()
            });
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 12;
            var height = $demoBody.height() - 124;
            $('.detailMap').css({top: '5px', left: '5px', width: width + 'px', height: height + 'px'});
        },

        destroy: function () {
            if (this.armedConflictLocationsView) {
                this.armedConflictLocationsView.destroy();
            }
            if (this.mapView) {
                this.mapView.destroy();
            }
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 6;
        }
    });

    return Demo6PageView;
});
