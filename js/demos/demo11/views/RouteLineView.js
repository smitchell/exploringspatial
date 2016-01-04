"use strict";
define([
    'jquery',
    'backbone',
    'leaflet',
    'models/Command'
], function ($, Backbone, L, Command) {
    var RouteLineView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.linesGroup = args.linesGroup;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            this.render();
        },

        render: function () {
               var line = this.model.get('lineString');
               var latLngs = [];
               $.each(line, function(i, point){
                   latLngs.push(L.latLng(point[1], point[0]));
               });
               this.lineLayer = L.polyline(latLngs).addTo(this.linesGroup);
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteLineView;
});
