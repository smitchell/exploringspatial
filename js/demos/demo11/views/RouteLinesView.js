"use strict";
define(function(require) {
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
            this.googleDirections = args.googleDirections;
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
                var _this = this;
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
                    _this.lineViews[i] = new RouteLineView({
                        map: _this.map,
                        googleDirections: _this.googleDirections,
                        model: new Line({
                            lineIndex: i,
                            lineString: lineString,
                            meters: distanceMeters
                        }),
                        linesGroup: _this.linesGroup,
                        // Magic number... if length is two "presumes" directions have not been fetched yet.
                        // (we don't want to call directions for every line segement each time the route gets extended.
                        // The line must be set back to two points to force directions to be called again.
                        snapToRoads: _this.snapToRoads && lineString.length === 2,
                        dispatcher: _this.dispatcher
                    });
                });

                var d = properties.get('meters');
                if (d != distanceMeters) {
                    properties.set('meters', distanceMeters);
                }
            }
        },

        onLineChanged: function (event) {
            var geometry = this.model.get('geometry');
            var lineStrings = geometry.get('coordinates');
            var polyline = event.line.get('lineString');
            var lineIndex = event.line.get('lineIndex');
            lineStrings[lineIndex] = polyline;
            var distanceMeters = 0;
            if (lineIndex > 0) {
                var previousLine = lineStrings[lineIndex - 1];
                // set last point of previous line to first point of changed line and recommpute distance
                var secondToLastPoint = previousLine[previousLine.length - 2];
                distanceMeters = secondToLastPoint[2];
                var firstPoint = polyline[0];
                distanceMeters += L.latLng(secondToLastPoint[1], secondToLastPoint[0]).distanceTo(L.latLng(firstPoint[1], firstPoint[0]));
                polyline[0][2] = distanceMeters;
                previousLine[previousLine.length - 1] = polyline[0];
            }
            var prevPoint;
            if (lineIndex < lineStrings.length - 1) {
                var nextLine = lineStrings[lineIndex + 1];
                // set first point of next line to last point of changed line
                nextLine[0] = polyline[polyline.length - 1];
                for (var i = lineIndex; i < lineStrings.length; i++) {
                    prevPoint = null;
                    // Assign distances to points
                    $.each(lineStrings[i], function (i, point) {
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
                }
            }
            geometry.set({'coordinates': lineStrings});
            geometry.trigger('change:coordinates');
        },

        onChangeSnapToRoads: function (args) {
            this.snapToRoads = args.snapToRoads;
            $.each(this.lineViews, function (i, lineView) {
                lineView.snapToRoads = args.snapToRoads;
            });
        },


        clearLines: function () {
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
