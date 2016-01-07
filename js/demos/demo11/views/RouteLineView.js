"use strict";
define(function(require) {
    var $            = require('jquery'),
        Backbone     = require('backbone'),
        L            = require('leaflet');

    var RouteLineView = Backbone.View.extend({

        initialize: function (args) {
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

            this.lineLayer.on('mouseout', function(event) {
                _this.onMouseout(event);
            });

        },

        onMouseover: function(event) {
            this.logEvent(event);
            this.lineLayer.setStyle(this.highlight);
            this.clearMarkers();
            var lineString = this.model.get('lineString');
            var point = lineString[0];
            var markerGroup = L.layerGroup();
            var lineIndex = this.model.get('lineIndex');
            // Add a starting marker to any line except the first line.
            if (lineIndex > 0) {
                this.startingMarker = L.marker({lat: point[1], lng: point[0]}, {
                    icon: this.startIcon,
                    draggable: false
                }).addTo(markerGroup);
            }

            // Add an ending marker to any line except the last line.
            if (lineIndex < this.model.get('lineCount') - 1) {
                point = lineString[lineString.length - 1];
                this.endingMarker = L.marker({lat: point[1], lng: point[0]}, {icon: this.endIcon, draggable: false}).addTo(markerGroup);
            }
            // Only add the feature group if it contains one of the two markers.
            // If there is only one line on the map, the marker Group will be empty.
            if (this.startingMarker || this.endingMarker) {
                markerGroup.addTo(this.map);
                this.markerGroup = markerGroup;
            }
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
