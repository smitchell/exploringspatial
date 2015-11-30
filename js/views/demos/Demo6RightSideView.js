define([
    'jquery',
    'underscore',
    'backbone',
    'models/acled/AcledSearch',
    'collections/CodeDefinitions',
    'views/acled/AcledMapView',
    'views/acled/ArmedConflictLocationsView',
    'text!templates/demos/Demo6RightSideView.html'
], function ($, _,
             Backbone,
             AcledSearch,
             CodeDefinitions,
             AcledMapView,
             ArmedConflictLocationsView,
             templateHtml) {
    var Demo6RightSideView = Backbone.View.extend({
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
    return Demo6RightSideView;
});
