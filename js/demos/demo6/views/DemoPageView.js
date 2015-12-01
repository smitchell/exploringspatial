define([
    'jquery',
    'underscore',
    'backbone',
    'demos/demo6/models/AcledSearch',
    'demos/demo6/collections/CodeDefinitions',
    'demos/demo6/views/AcledMapView',
    'demos/demo6/views/ArmedConflictLocationsView',
    'text!demos/demo6/templates/RightSideView.html'
], function ($, _,
             Backbone,
             AcledSearch,
             CodeDefinitions,
             AcledMapView,
             ArmedConflictLocationsView,
             templateHtml) {
    var RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.collection = new CodeDefinitions("COUNTRY");
            var _this = this;
            this.collection.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
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
        }
    });
    return RightSideView;
});
