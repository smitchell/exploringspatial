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
            this.dispatcher = args.dispatcher;
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [33, 50],
                    iconAnchor: [16, 49]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});
            this.listenTo(this.model, 'change:coordinates', this.render);
            var _this = this;
        },


        render: function () {
            this.clearMarkers();
            this.clearRubberBands();
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
                this.startPoint = L.marker(latLng, {icon: this.startIcon, draggable: true}).addTo(this.markerGroup);
            } else {
                this.startPoint = L.marker(latLng, {icon: this.startIcon, draggable: true});
                this.markerGroup = L.layerGroup([this.startPoint]).addTo(this.map);
            }
            // dragstart, predrag, drag, dragend
            console.log('Start marker ' + this.startPoint._leaflet_id);
            var _this = this;
            this.startPoint.on('dragstart', function (event) {
                _this.onDragStart(event);
            });
            this.startPoint.on('drag', function (event) {
                _this.onDragging(event);
            });
            this.startPoint.on('dragend', function (event) {
                _this.onDragEnd(event);
            });
        },

        addEndingPoint: function (latLng) {
            this.endPoint = L.marker(latLng, {icon: this.endIcon, draggable: true}).addTo(this.markerGroup);
            var _this = this;
            this.endPoint.on('dragstart', function (event) {
                _this.onDragStart(event);
            });
            this.endPoint.on('drag', function (event) {
                _this.onDragging(event);
            });
            this.endPoint.on('dragend', function (event) {
                _this.onDragEnd(event);
            });
        },

        onDragStart: function (event) {
            this.logEvent(event);
            var lineIndex, pointIndex;
            if (event.target._leaflet_id === this.startPoint._leaflet_id) {
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
            this.logEvent(event);
            this.dispatcher.trigger(this.dispatcher.Events.DRAG_END, event);
        },

        onDragging: function (event) {
            this.clearRubberBands();
            if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
                var lineString, adjacentPoint;
                var latLng = event.target._latlng;
                if (event.target._leaflet_id === this.startPoint._leaflet_id) {
                    lineString = lineStrings[0];
                    adjacentPoint = lineString[1];
                } else {
                    lineString = lineStrings[lineStrings.length - 1];
                    adjacentPoint = lineString[lineString.length - 2];
                }
                if (this.rubberBandLayer) {
                    L.polyline([latLng, L.latLng(adjacentPoint[1], adjacentPoint[0])], {
                        color: '#808080',
                        weight: '2',
                        dashArray: "1, 5"
                    }).addTo(this.rubberBandLayer);
                } else {
                    var polyline = L.polyline([latLng, L.latLng(adjacentPoint[1], adjacentPoint[0])], {
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

        logEvent: function (event) {
            if (event && console.log) {
                var latLng = event.target._latlng;
                console.log(event.type + " " + event.target._leaflet_id + " " + latLng.lat + " " + latLng.lng);
            }
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
