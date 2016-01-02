"use strict";
define([
    'jquery',
    'backbone',
    'leaflet',
    'models/Command'
], function ($, Backbone, L, Command) {
    var RouteLinesView = Backbone.View.extend({

        commands: [],

        initialize: function (args) {
            this.map = args.map;
            this.commands = args.commands;
            this.listenTo(this.model, 'change:coordinates', this.render);
        },


        render: function () {
            this.clearLines();
            var point, lineString;

           if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
               var _this = this;
               $.each(lineStrings, function(i, lineString) {
                   _this.addLine(lineString);
               });
            }
        },

        addLine: function(line) {
            var latLngs = [];
            var lineString = '';
            $.each(line, function(i, point){
                latLngs.push(L.latLng(point[1], point[0]));
                lineString += point[1];
                lineString += point[0];
            });
            var lineLayer;
            if (this.linesGroup) {
                lineLayer = L.polyline(latLngs).addTo(this.linesGroup);
            } else {
                var polyline = L.polyline(latLngs);
                this.linesGroup = L.layerGroup([polyline]).addTo(this.map);
            }
        },

        clearLines: function () {
            if (this.linesGroup) {
                this.linesGroup.clearLayers();
            }
        },

        destroy: function () {
            if (this.linesGroup) {
                this.map.removeLayer(this.linesGroup);
            }
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteLinesView;
});
