"use strict";
define(function(require) {
    var $            = require('jquery'),
        Backbone     = require('backbone'),
        L            = require('leaflet'),

        templateHtml = require('text!demos/demo11/templates/PointControlView.html');

    var RouteLineView = Backbone.View.extend({

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.map = args.map;
            this.lineRouter = args.lineRouter;
            this.linesGroup = args.linesGroup;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/green_16x16.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/red_16x16.png'});
            this.style = {
                weight: 5
            };
            this.highlight = {
                weight: 8
            };
            this.metersToMiles = 0.000621371;
            if (this.snapToRoads) {
                this.fetchData();
            } else {
                this.render();
            }
        },

        fetchData: function () {
            var line = this.model.get('lineString');
            var start = line[0];
            var finish = line[line.length - 1];
            // Temporary "loading" line
            this.lineLayer = L.polyline([L.latLng(start[1], start[0]), L.latLng(finish[1], finish[0])], {
                color: '#808080',
                weight: '2',
                dashArray: "1, 5"
            }).addTo(this.linesGroup);
            var _this = this;
            this.lineRouter.getDirections({
                line: line,
                success: function(lineString) {_this.onSuccess(lineString)},
                error: function(response, xtr) {_this.onError(response, xtr)}
            });
        },

        onSuccess: function (lineString) {
            this.model.set({'lineString': lineString});
            this.dispatcher.trigger(this.dispatcher.Events.LINE_CHANGE, {
                line: this.model
            });
            this.render();
        },

        onError: function (response, status) {
            this.snapToRoads = false;
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
            var _this = this;
            this.lineLayer = L.polyline(latLngs, this.style ).addTo(this.linesGroup);

            this.lineLayer.on('mouseover', function(event) {
                _this.onMouseover(event);
            });

        },

        onMouseover: function(event) {
            this.logEvent(event);
            this.lineLayer.setStyle(this.highlight);
            this.clearMarkers();
            var lineString = this.model.get('lineString');
            var startPoint = lineString[0];
            this.markerGroup = L.layerGroup().addTo(this.map);
            var lineIndex = this.model.get('lineIndex');
            var _this = this;
            // Add a starting marker to any line except the first line.
            if (lineIndex > 0) {
                this.startingMarker = L.marker({lat: startPoint[1], lng: startPoint[0]}, {
                    icon: this.startIcon,
                    riseOnHover: true,
                    draggable: false
                }).addTo(this.markerGroup);
                // bind popup on the fly so popupopen flag can be set, otherwise, mouseout will remove the highlighted line and popup
                this.startingMarker.on('click', function() {
                    _this.popupopen = true;
                    _this.startingMarker.bindPopup( _this.createPopup(startPoint, 0, 0, 'startPoint'));
                    _this.startingMarker.openPopup();
                });
            }

            // Add an ending marker to any line except the last line.
            if (lineIndex < this.model.get('lineCount') - 1) {
                var endPoint = lineString[lineString.length - 1];
                this.endingMarker = L.marker({lat: endPoint[1], lng: endPoint[0]}, {
                    icon: this.endIcon,
                    riseOnHover: true,
                    draggable: false
                }).addTo(this.markerGroup);
                // bind popup on the fly so popupopen flag can be set, otherwise, mouseout will remove the highlighted line and popup
                this.endingMarker.on('click', function() {
                    _this.popupopen = true;
                    _this.endingMarker.bindPopup(_this.createPopup(endPoint, lineIndex, 9999999999, 'endPoint'));
                    _this.endingMarker.openPopup();
                });
            }
            // Only add the feature group if it contains one of the two markers.
            // If there is only one line on the map, the marker Group will be empty.
            if (this.startingMarker || this.endingMarker) {
                this.markerGroup.addTo(this.map);
            }
            // Fire the mouseOut method the first time the mouse moves off of this line.
            this.map.addOneTimeEventListener('mouseover', this.onMouseout, this);
        },

        createPopup: function (point, lineIndex, pointIndex, triggerId) {
            var _this = this;
            return L.popup({offset: L.point(0, 0)}).setContent(this.template({
                latitude: Math.round(point[1] * 100000) / 100000,
                longitude: Math.round(point[0] * 100000) / 100000,
                distance: Math.round(point[2] * this.metersToMiles * 100) / 100,
                triggerId: triggerId
            })).on('popupclose', function() {
                _this.popupopen = false;
                _this.onMouseout()
            });
        },

        onMouseout: function() {
            // Ignore the first mouse out if popup is open so that
            // user can move the mouse to the popup without unhighlighting line.
            if (!this.popupopen) {
                this.lineLayer.setStyle(this.style);
                this.clearMarkers();
            }
        },

        clearMarkers: function () {
            if (this.markerGroup) {
                this.markerGroup.clearLayers();
            }
            if (this.startingMarker) {
                delete this.startingMarker;
            }
            if (this.endingMarker) {
                delete this.endingMarker;
            }
        },

        onDeleteClick: function (event) {
            this.logEvent(event);
            var lineIndex, pointIndex, point;
            if (event.target.id == 'startPoint') {
                lineIndex = 0;
                pointIndex = 0;
                point = this.startingPoint;
            } else {
                // Get the last point of the last line.
                var lineStrings = this.model.get('coordinates');
                var lineString = lineStrings[lineStrings.length - 1];
                lineIndex = lineStrings.length - 1;
                /* The points in the polyline change when Direction service is called.
                 * Setting a large value then and adjusting it here solves that problem.
                 */
                pointIndex = 999999999;
                point = this.endingPoint;
            }
            this.dispatcher.trigger(this.dispatcher.Events.MARKER_DELETE, {
                lineIndex: lineIndex,
                pointIndex: pointIndex,
                point: point,
                layer: event.target
            });
        },

        logEvent: function (event) {
            if (event && console.log) {
                console.log(event.type + ' leaflet Id' + event.target._leaflet_id);
            }
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteLineView;
});
