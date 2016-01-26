define(function(require) {
    "use strict";
    var $             = require('jquery'),
        Backbone      = require('backbone'),
        L             = require('leaflet'),
        Line          = require('models/Line'),
        RouteLineView = require('demos/demo11/views/RouteLineView');

    var RouteLinesView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            this.lineRouter = args.lineRouter;
            this.routeManager = args.routeManager;
            this.rubberBandLayer = args.rubberBandLayer;
            this.lineControlLayer = args.lineControlLayer;
            var geometry = this.model.get('geometry');
            this.listenTo(geometry, 'change:coordinates', this.render);
            this.lineViews = [];
            this.dispatcher.on(this.dispatcher.Events.CHANGE_SNAP_TO_ROAD, this.onChangeSnapToRoads, this);
            this.dispatcher.on(this.dispatcher.Events.LINE_CHANGE, this.onLineChanged, this);
            this.linesGroup = L.featureGroup().addTo(this.map);
        },


        render: function () {
            this.clearLines();
            var properties = this.model.get('properties');
            properties.set('meters', 0);
            var geometry = this.model.get('geometry');
            if (geometry.get('type') === 'MultiLineString') {
                var lineStrings = geometry.get('coordinates');
                var self = this;
                var prevPoint;
                var distanceMeters = 0;
                $.each(lineStrings, function (i, lineString) {
                    prevPoint = null;
                    // Assign distances to points
                    $.each(lineString, function (i, point) {
                        var latLng = L.latLng(point[1], point[0]);
                        if (prevPoint != null) {
                            distanceMeters += latLng.distanceTo(prevPoint);
                            point[2] = distanceMeters;
                        } else {
                            // zero or distanceMeters for last point in previous line
                            point[2] = distanceMeters;
                        }
                        prevPoint = latLng;
                    });
                    self.lineViews[i] = new RouteLineView({
                        map: self.map,
                        lineRouter: self.lineRouter,
                        rubberBandLayer: self.rubberBandLayer,
                        lineControlLayer: self.lineControlLayer,
                        model: new Line({
                            lineCount: lineStrings.length,
                            lineIndex: i,
                            lineString: lineString,
                            meters: distanceMeters
                        }),
                        linesGroup: self.linesGroup,
                        // Magic number... if length is two "presumes" directions have not been fetched yet.
                        // (we don't want to call directions for every line segement each time the route gets extended.
                        // The line must be set back to two points to force directions to be called again.
                        snapToRoads: self.snapToRoads && lineString.length === 2,
                        dispatcher: self.dispatcher
                    });
                });

                var d = properties.get('meters');
                if (d != distanceMeters) {
                    properties.set('meters', distanceMeters);
                }
            }
        },

        onLineChanged: function (event) {
            this.routeManager.updateLine({
                geometry: this.model.get('geometry'),
                polyline: event.line.get('lineString'),
                lineIndex: event.line.get('lineIndex')
            });
        },

        onChangeSnapToRoads: function (args) {
            this.snapToRoads = args.snapToRoads;
            $.each(this.lineViews, function (i, lineView) {
                lineView.snapToRoads = args.snapToRoads;
            });
        },


        clearLines: function () {
            if (this.rubberBandLayer) {
                this.rubberBandLayer.clearLayers();
            }
            if (this.linesGroup) {
                this.linesGroup.clearLayers();
            }
            if (this.lineViews) {
                $.each(this.lineViews, function(i, lineView){
                    lineView.destroy();
                });
                this.lineViews = [];
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
