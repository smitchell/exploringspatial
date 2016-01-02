"use strict";
define([
    'jquery',
    'backbone',
    'leaflet',
    'models/Command'
], function ($, Backbone, L, Command) {
    var RouteTerminusView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.commands = args.commands;
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [33, 50],
                    iconAnchor: [16, 49]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});
            this.listenTo(this.model, 'change:coordinates', this.render);
        },


        render: function () {
            this.clearMarkers();
            var point, lineString;

            if (this.model.get('type') === 'Point') {
                point = this.model.get('coordinates');
                this.addStartingPoint(L.latLng(point[1], point[0]));
            } else if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
                if (lineStrings.length > 0) {
                    lineString = lineStrings[0];
                    point = lineString[0];
                    this.addStartingPoint(L.latLng(point[1], point[0]));

                    // Get the last point of the last line.
                    lineString = lineStrings[lineStrings.length - 1];
                    point = lineString[lineString.length - 1];
                    this.addEndingPoint(L.latLng(point[1], point[0]));
                }
            }
        },

        addStartingPoint: function (latLng) {
            if (this.markerGroup) {
                this.startPoint = L.marker(latLng, {icon: this.startIcon}).addTo(this.markerGroup);
            } else {
                this.startPoint = L.marker(latLng, {icon: this.startIcon});
                this.markerGroup = L.layerGroup([this.startPoint]).addTo(this.map);
            }
        },

        addEndingPoint: function (latLng) {
            this.endPoint = L.marker(latLng, {icon: this.endIcon}).addTo(this.markerGroup);
        },

        clearMarkers: function () {
            if (this.markerGroup) {
                this.markerGroup.clearLayers();
            }
        },

        destroy: function () {
            if (this.markerGroup) {
                this.map.removeLayer(this.markerGroup);
            }
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteTerminusView;
});
