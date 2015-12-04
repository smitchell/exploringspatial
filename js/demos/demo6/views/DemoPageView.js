define([
    'jquery',
    'underscore',
    'backbone',
    'demos/demo6/models/AcledSearch',
    'demos/demo6/collections/CodeDefinitions',
    'demos/demo6/views/AcledMapView',
    'demos/demo6/views/ArmedConflictLocationsView',
    'text!demos/demo6/templates/DemoPageView.html'
], function ($, _,
             Backbone,
             AcledSearch,
             CodeDefinitions,
             AcledMapView,
             ArmedConflictLocationsView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.collection = new CodeDefinitions("COUNTRY");
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
            var acledSearch = new AcledSearch();
            this.mapView = new AcledMapView({
                acledSearch: acledSearch,
                countries: this.collection,
                lat: 1.5818302639606454,
                lon: 16.787109375,
                zoom: 3
            });
            new ArmedConflictLocationsView({
                acledSearch: acledSearch,
                collection:
                this.collection,
                map: this.mapView.getMap()
            });
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
