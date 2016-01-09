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
            this.linesGroup = args.linesGroup;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            this.googleDirections = args.googleDirections;
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/green_12x12.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/red_12x12.png'});
            this.style = {
                weight: 3
            };
            this.highlight = {
                weight: 5
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
            this.dispatcher.trigger(this.dispatcher.Events.LINE_CHANGE, {
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
            var _this = this;
            this.lineLayer = L.polyline(latLngs, this.style ).addTo(this.linesGroup);

            this.lineLayer.on('mouseover', function(event) {
                _this.onMouseover(event);
            });

            //this.lineLayer.on('mouseout', function(event) {
            //    _this.onMouseout(event);
            //});

        },

        onMouseover: function(event) {
            this.logEvent(event);
            this.lineLayer.setStyle(this.highlight);
            this.clearMarkers();
            var lineString = this.model.get('lineString');
            var point = lineString[0];
            this.markerGroup = L.layerGroup().addTo(this.map);
            var lineIndex = this.model.get('lineIndex');
            var popup;
            // Add a starting marker to any line except the first line.
            if (lineIndex > 0) {
                popup = this.createPopup(point, 0, 0, 'startPoint');
                this.startingMarker = L.marker({lat: point[1], lng: point[0]}, {
                    icon: this.startIcon,
                    draggable: false
                }).bindPopup(popup).addTo(this.markerGroup);
            }

            // Add an ending marker to any line except the last line.
            if (lineIndex < this.model.get('lineCount') - 1) {
                point = lineString[lineString.length - 1];
                popup = this.createPopup(point, lineIndex, 9999999999, 'endPoint');
                this.endingMarker = L.marker({lat: point[1], lng: point[0]}, {icon: this.endIcon, draggable: false}).bindPopup(popup).addTo(this.markerGroup);
            }
            // Only add the feature group if it contains one of the two markers.
            // If there is only one line on the map, the marker Group will be empty.
            if (this.startingMarker || this.endingMarker) {
                this.markerGroup.addTo(this.map);
            }
        },

        createPopup: function (point, lineIndex, pointIndex, triggerId) {
            return L.popup({offset: L.point(0, -35)}).setContent(this.template({
                latitude: Math.round(point[1] * 100000) / 100000,
                longitude: Math.round(point[0] * 100000) / 100000,
                distance: Math.round(point[2] * this.metersToMiles * 100) / 100,
                triggerId: triggerId
            }));
        },

        onMouseout: function(event) {
            this.logEvent(event);
            this.lineLayer.setStyle(this.style);
            this.clearMarkers();
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
