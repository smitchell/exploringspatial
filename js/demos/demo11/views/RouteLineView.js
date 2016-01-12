"use strict";
define(function (require) {
    var $        = require('jquery'),
        Backbone = require('backbone'),
        _        = require('underscore'),
        L = require('leaflet'),

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
                weight: 3
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
                success: function (lineString) {
                    _this.onSuccess(lineString)
                },
                error: function (response, xtr) {
                    _this.onError(response, xtr)
                }
            });
        },

        onSuccess: function (lineString) {
            this.model.set({'lineString': lineString});
            this.dispatcher.trigger(this.dispatcher.Events.LINE_CHANGE, {
                line: this.model
            });
            this.render();
        },

        onError: function () {
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
            this.lineLayer = L.polyline(latLngs, this.style).addTo(this.linesGroup);

            this.lineLayer.on('mouseover', function (event) {
                _this.onMouseover(event);
            });

        },

        onMouseover: function (event) {
            this.logEvent(event);
            var _this = this;
            this.lineLayer.setStyle(this.highlight);
            this.clearMarkers();
            var lineString = this.model.get('lineString');
            this.markerGroup = L.layerGroup().addTo(this.map);
            var lineIndex = this.model.get('lineIndex');
            // Add a starting marker to any line except the first line.
            if (lineIndex > 0) {
                this.startingMarker = this.addStartMarker(lineString[0]);
            }

            // Add an ending marker to any line except the last line.
            if (lineIndex < this.model.get('lineCount') - 1) {
                this.endingMarker = this.addEndMarker(lineString[lineString.length - 1]);
            }

            // Only add the feature group if it contains one of the two markers.
            // If there is only one line on the map, the marker Group will be empty.
            if (this.startingMarker || this.endingMarker) {
                this.markerGroup.addTo(this.map);
            }
            // Fire the mouseOut method the first time the mouse moves off of this line.
            this.map.addOneTimeEventListener('mouseover', this.onMouseout, this);
        },

        addStartMarker: function (point) {
            var _this = this;
            var marker = L.marker({lat: point[1], lng: point[0]}, {
                icon: this.startIcon,
                riseOnHover: true,
                draggable: false
            }).addTo(this.markerGroup);
            // bind popup on the fly so popupopen flag can be set, otherwise, mouseout will remove the highlighted line and popup
            marker.on('click', function () {
                _this.popupopen = true;
                var popup = _this.createPopup(point, 0, RouteLineView.START_TRIGGER_ID);
                marker.bindPopup(popup);
                marker.openPopup().on('popupclose', function (event) {_this.onClosePopup(event);});
                // Bind new click event
                $(popup._container).on('click', '.popupTrigger', function (event) {
                    _this.onDeleteClick(event, popup);
                });
            });
            return marker;
        },

        addEndMarker: function(point) {
            var _this = this;
            var marker = L.marker({lat: point[1], lng: point[0]}, {
                icon: this.endIcon,
                riseOnHover: true,
                draggable: false
            }).addTo(this.markerGroup);
            // bind popup on the fly so popupopen flag can be set, otherwise, mouseout will remove the highlighted line and popup
            var popup = _this.createPopup(point, 9999999999, RouteLineView.END_TRIGGER_ID);
            marker.on('click', function () {
                _this.popupopen = true;
                marker.bindPopup(popup);
                marker.openPopup().on('popupclose', function (event) {_this.onClosePopup(event);});
                $(popup._container).on('click', '.popupTrigger', function (event) {
                    _this.onDeleteClick(event, popup);
                });
            });
            return marker;
        },

        createPopup: function (point, pointIndex, triggerId) {
            return L.popup({offset: L.point(0, 0)}).setContent(this.template({
                latitude: Math.round(point[1] * 100000) / 100000,
                longitude: Math.round(point[0] * 100000) / 100000,
                distance: Math.round(point[2] * this.metersToMiles * 100) / 100,
                triggerId: triggerId
            }));
        },

        onClosePopup: function(event) {
            $(event.popup._container).off('click', '.popupTrigger');
            this.popupopen = false;
            this.lineLayer.setStyle(this.style);
            event.target.unbindPopup();
            this.clearMarkers();
        },

        onMouseout: function () {
            // Ignore the first mouse out if popup is open so that
            // user can move the mouse to the popup without unhighlighting line.
            if (!this.popupopen) {
                this.lineLayer.setStyle(this.style);
                this.clearMarkers();
            }
        },

        clearMarkers: function () {
            $('.popupTrigger').off('click');
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

        onDeleteClick: function (event, popup) {
            this.logEvent(event);
            var pointIndex, point;
            var lineIndex = this.model.get('lineIndex');
            if (event.target.id === RouteLineView.START_TRIGGER_ID) {
                pointIndex = 0;
                point = this.startingPoint;
            } else {
                // Get the last point of the last line.
                var lineStrings = this.model.get('coordinates');
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
            this.map.closePopup(popup);
        },

        logEvent: function (event) {
            if (event && console.log) {
                console.log(event.type + ' leaflet Id' + event.target._leaflet_id);
            }
        },

        destroy: function () {

            this.clearMarkers();
            // Remove view from DOM
            this.remove();
        }
    });

    RouteLineView.START_TRIGGER_ID = 'startPoint';
    RouteLineView.END_TRIGGER_ID = 'endPoint';

    return RouteLineView;
});
