/**
 * The purpose of the CountyListView is render feature collection GeoJson as a list.
 */
define([
    'underscore',
    'backbone',
    'leaflet'
], function (_, Backbone) {

    var CountyListView = Backbone.View.extend({
        labelLayer: null,

        initialize: function (args) {
            this.collection = args.collection;
                        }
            this.render();
        },

        render: function () {

        },

         onMouseover: function (event) {

        },

        onMouseout: function (event) {

        },


    });
    return CountyListView;
});
