"use strict";
define(function(require) {
    var $            = require('jquery'),
        _            = require('underscore'),
        Backbone     = require('backbone'),
        L            = require('leaflet'),
        templateHtml = require('text!demos/demo11/templates/PointControlView.html');

    var RouteTerminusView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.dispatcher = args.dispatcher;
            this.template = _.template(templateHtml);
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [33, 50],
                    iconAnchor: [16, 49]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});
            this.metersToMiles = 0.000621371;

            this.listenTo(this.model, 'change:coordinates', this.render);
        },


        render: function () {
            this.clearMarkers();
            this.clearRubberBands();
            var point, lineString, popup;

            if (this.model.get('type') === 'Point') {
                point = this.model.get('coordinates');
                popup = this.createPopup(point, 0, 0, RouteTerminusView.START_TRIGGER_ID);
                this.addStartingPoint(point, popup);
            } else if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
                if (lineStrings.length > 0) {
                    lineString = lineStrings[0];
                    point = lineString[0];
                    popup = this.createPopup(point, 0, 'startPoint');
                    this.addStartingPoint(point, popup);

                    // Get the last point of the last line.
                    lineString = lineStrings[lineStrings.length - 1];
                    point = lineString[lineString.length - 1];
                    popup = this.createPopup(point, 9999999999, RouteTerminusView.END_TRIGGER_ID);
                    this.addEndingPoint(point, popup);
                }
            }
        },

        addStartingPoint: function (point, popup) {
            this.startingPoint = point;
            var latLng = L.latLng(point[1], point[0]);
            if (this.markerGroup) {
                this.startingMarker = L.marker(latLng, {
                    icon: this.startIcon,
                    draggable: true
                }).bindPopup(popup).addTo(this.markerGroup);
            } else {
                this.startingMarker = L.marker(latLng, {icon: this.startIcon, draggable: true}).bindPopup(popup);
                this.markerGroup = L.layerGroup([this.startingMarker]).addTo(this.map);
            }
            var _this = this;
            this.startingMarker.on('dragstart', function (event) {
                _this.onDragStart(event);
            });
            this.startingMarker.on('drag', function (event) {
                _this.onDragging(event);
            });
            this.startingMarker.on('dragend', function (event) {
                _this.onDragEnd(event);
            });
            this.startingMarker.on('popupopen', function (event) {
                _this.onPopupOpen(event);
            });
        },

        addEndingPoint: function (point, popup) {
            this.endingPoint = point;
            var latLng = L.latLng(point[1], point[0]);
            this.endingMarker = L.marker(latLng, {icon: this.endIcon, draggable: true}).bindPopup(popup).addTo(this.markerGroup);
            var _this = this;
            this.endingMarker.on('dragstart', function (event) {
                _this.onDragStart(event);
            });
            this.endingMarker.on('drag', function (event) {
                _this.onDragging(event);
            });
            this.endingMarker.on('dragend', function (event) {
                _this.onDragEnd(event);
            });
            this.endingMarker.on('popupopen', function (event) {
                _this.onPopupOpen(event);
            });
        },

        createPopup: function (point, pointIndex, triggerId) {
            return L.popup({offset: L.point(0, -35)}).setContent(this.template({
                latitude: Math.round(point[1] * 100000) / 100000,
                longitude: Math.round(point[0] * 100000) / 100000,
                distance: Math.round(point[2] * this.metersToMiles * 100) / 100,
                triggerId: triggerId
            }));
        },

        onPopupOpen: function (event) {
            var popup = event.popup;
            var _this = this;
            $(popup._container).on('click', '.popupTrigger', function (event) {
                _this.onDeleteClick(event, popup);
            });

        },

        onDragStart: function (event) {
            var lineIndex, pointIndex;
            if (event.target._leaflet_id === this.startingMarker._leaflet_id) {
                lineIndex = 0;
                pointIndex = 0;
            } else {
                // Get the last point of the last line.
                var lineStrings = this.model.get('coordinates');
                var lineString = lineStrings[lineStrings.length - 1];
                lineIndex = lineStrings.length - 1;
                pointIndex = lineString.length - 1;
            }
            this.dispatcher.trigger(this.dispatcher.Events.DRAG_START, {
                lineIndex: lineIndex,
                pointIndex: pointIndex,
                latLng: event.target._latlng,
                originalEvent: event
            });
        },

        onDragEnd: function (event) {
            this.dispatcher.trigger(this.dispatcher.Events.DRAG_END, event);
        },

        onDeleteClick: function (event) {
            var lineIndex, pointIndex, point;
            if (event.target.id === RouteTerminusView.START_TRIGGER_ID) {
                lineIndex = 0;
                pointIndex = 0;
                point = this.startingPoint;
            } else {
                // Get the last point of the last line.
                var lineStrings = this.model.get('coordinates');
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

        onDragging: function (event) {
            this.clearRubberBands();
            if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
                var lineString, oppositePoint;
                var latLng = event.target._latlng;
                if (event.target._leaflet_id === this.startingMarker._leaflet_id) {
                    lineString = lineStrings[0];
                    oppositePoint = lineString[lineString.length - 1];
                } else {
                    lineString = lineStrings[lineStrings.length - 1];
                    oppositePoint = lineString[0];
                }
                if (this.rubberBandLayer) {
                    L.polyline([latLng, L.latLng(oppositePoint[1], oppositePoint[0])], {
                        color: '#808080',
                        weight: '2',
                        dashArray: "1, 5"
                    }).addTo(this.rubberBandLayer);
                } else {
                    var polyline = L.polyline([latLng, L.latLng(oppositePoint[1], oppositePoint[0])], {
                        color: '#808080',
                        weight: '2',
                        dashArray: "1, 5"
                    });
                    this.rubberBandLayer = L.layerGroup([polyline]).addTo(this.map);
                }
            }
        },

        handleMouseout: function (event) {
            this.clearRubberBands();
        },

        clearRubberBands: function () {
            if (this.rubberBandLayer) {
                this.rubberBandLayer.clearLayers();
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
            if (this.startingPoint) {
                delete this.startingPoint;
            }
            if (this.endingPoint) {
                delete this.endingPoint;
            }
        },

        destroy: function () {
            this.clearMarkers();
            if (this.markerGroup) {
                this.map.removeLayer(this.markerGroup);
            }
            // Remove view from DOM
            this.remove();
        }
    });

    RouteTerminusView.START_TRIGGER_ID = 'startPoint';
    RouteTerminusView.END_TRIGGER_ID = 'endPoint';

    return RouteTerminusView;
});
