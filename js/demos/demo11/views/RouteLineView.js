"use strict";
define([
    'jquery',
    'backbone',
    'leaflet',
    'models/GoogleDirections'
], function ($, Backbone, L, GoogleDirections) {
    var RouteLineView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.linesGroup = args.linesGroup;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            this.googleDirections = new GoogleDirections();
            if (this.snapToRoads) {
                this.fetchData();
            } else {
                this.render();
            }
        },

        fetchData: function () {
            var line = this.model.get('lineString');
            var _this = this;
            var start = line[0];
            var finish = line[line.length - 1];
            // Temporary "loading" line
            this.lineLayer = L.polyline([L.latLng(start[1], start[0]), L.latLng(finish[1], finish[0])], {
                color: '#808080',
                weight: '2',
                dashArray: "1, 5"
            }).addTo(this.linesGroup);
            this.googleDirections.set({origin: start, destination: finish});
            this.googleDirections.fetch({
                success: function () {
                    _this.onSuccess();
                },
                error: function (object, xhr) {
                    _this.loading -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        onSuccess: function () {
            this.model.set({'lineString': this.googleDirections.get('polyline')});
            this.dispatcher.trigger(this.dispatcher.Events.LINE_CHANGED, {
                line: this.model
            });
            this.render();
        },

        render: function () {
            if (this.lineLayer) {
                this.linesGroup.removeLayer(this.lineLayer);
            }
            var line = this.model.get('lineString');
            var latLngs = [];
            $.each(line, function (i, point) {
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
