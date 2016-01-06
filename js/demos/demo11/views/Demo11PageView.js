"use strict";
define(function(require) {
    var $                      = require('jquery'),
        _                      = require('underscore'),
        Backbone               = require('backbone'),
        L                      = require('leaflet'),
        MapEventDispatcher     = require('apps/MapEventDispatcher'),
        Location               = require('models/Location'),
        GoogleGeoCoder         = require('models/GoogleGeoCoder'),
        Feature                = require('models/Feature'),
        Command                = require('models/Command'),
        GoogleDirections       = require('models/GoogleDirections'),
        Commands               = require('collections/Commands'),
        MapLocationControlView = require('demos/demo11/views/MapLocationControlView'),
        RoutePropertiesView    = require('demos/demo11/views/RoutePropertiesView'),
        RouteControlsView      = require('demos/demo11/views/RouteControlsView'),
        ElevationChartView     = require('demos/demo11/views/ElevationChartView'),
        RouteTerminusView      = require('demos/demo11/views/RouteTerminusView'),
        RouteLinesView         = require('demos/demo11/views/RouteLinesView'),
        templateHtml           = require('text!demos/demo11/templates/Demo11PageView.html');

     var Demo11PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.smallIcon = L.Icon.extend({
                options: {
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    iconUrl: 'http://www.exploringspatial.com/media/target.png'
                }
            });
            this.metersToMiles = 0.000621371;
            this.dispatcher = MapEventDispatcher;
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOVER, this.onChartMouseOver, this);
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOUT, this.onChartMouseOut, this);
            this.dispatcher.on(this.dispatcher.Events.DRAG_START, this.onDragStart, this);
            this.dispatcher.on(this.dispatcher.Events.DRAG_END, this.onDragEnd, this);
            this.dispatcher.on(this.dispatcher.Events.MARKER_DELETE, this.onMarkerDelete, this);
            this.googleDirections = new GoogleDirections({dispatcher: this.dispatcher, transitMode: 'Bicycling'});
            this.model = new Feature();
            this.model.get('properties').set('name', '');
            this.model.get('properties').set('meters', 0);
            this.smallIcon = L.Icon.extend({
                options: {
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    iconUrl: 'http://www.exploringspatial.com/media/target.png'
                }
            });
            this.toolTipCssIcon = L.divIcon({
                className: 'map-tooltip',
                iconAnchor: [230, 12],
                iconSize: [205, 18],
                html: 'Click the map to add your first point.'
            });
            this.commands = new Commands();
            this.snapToRoads = true;
            this.render();
        },

        render: function () {
            this.$el.html(this.template({model: this.model.get('properties').toJSON()}));
            // Render map
            this.sizeMaps();
            this.map = L.map('map_container').addLayer(new L.Google('ROADMAP'));
            this.map.setView({lat: 38.974974, lng: -94.657152}, 16);
            this.MapLocationControlView = new MapLocationControlView({
                map: this.map,
                model: this.model,
                el: this.$('#locationContainer')
            });
            this.routePropertiesView = new RoutePropertiesView({
                model: this.model.get('properties'),
                el: this.$('#propertiesContainer')
            });
            this.routeControlsView = new RouteControlsView({
                model: this.model,
                commands: this.commands,
                dispatcher: this.dispatcher,
                snapToRoads: this.snapToRoads,
                googleDirections: this.googleDirections,
                el: this.$('#controlsContainer')
            });
            if (this.elevationChartView) {
                this.elevationChartView.render();
            } else {
                this.elevationChartView = new ElevationChartView({
                    el: this.$('#chart'),
                    collection: [],
                    dispatcher: this.dispatcher
                });
            }

            var _this = this;
            this.map.on('click', _this.handleAddPoint, this);
            this.map.on('mouseout', _this.handleMouseout, this);
            this.map.on('mouseover', _this.logEvent, this);
            this.map.on('focus', _this.logEvent, this);
            this.map.on('blur', _this.logEvent, this);
            var geometry = this.model.get('geometry');
            var $mapContainer = $('#map_container');
            $mapContainer.css('cursor', 'crosshair');
            if (!geometry.get('type') || geometry.get('coordinates').length == 0) {
                // Add getting started tooltip
                this.addTooltip();
            } else {
                $mapContainer.css('cursor', '');
            }
            this.routeTerminusView = new RouteTerminusView({
                map: this.map,
                model: geometry,
                dispatcher: this.dispatcher
            });
            this.routeLinesView = new RouteLinesView({
                map: this.map,
                model: this.model,
                dispatcher: this.dispatcher,
                snapToRoads: this.snapToRoads,
                googleDirections: this.googleDirections
            });
        },

        addToolTip: function (event) {
            this.clearDotMarker();
            if (event.latlng) {
                this.bullseyeLabel = L.marker(event.latlng, {icon: this.toolTipCssIcon}).addTo(this.map);
            }
        },

        onMarkerDelete: function(args) {
            var geometry = this.model.get('geometry');
            var coordinates, lineStrings;
            if (geometry.get('type') === 'MultiLineString') {
                var type = 'MultiLineString';
                lineStrings = geometry.get('coordinates'); // Array of line strings
                var newLineStrings = [];
                var pointIndex = args.pointIndex;
                $.each(lineStrings, function(i, lineString) {
                    /* The points in the polyline change when Direction service is called.
                     * Setting a large value then and adjusting it here solves that problem.
                     */
                    if (args.pointIndex > lineString.length - 1) {
                        pointIndex = lineString.length - 1;
                    }
                    if (i == args.lineIndex) {
                        // Delete point from linestring
                        if (pointIndex == 0) {
                            // Deleting the first point is the same as deleting the whole line.
                            // The intermediate points were just added by the Directions service
                            lineString = [lineString[lineString.length - 1]];
                        } else if (pointIndex == lineString.length - 1) {
                            // Deleting the last point is the same as deleting the whole line.
                            // The intermediate points were just added by the Directions service
                            lineString = [lineString[0]];
                        }

                        // Determine disposition of remaining points in this line based on context
                        if (lineString.length == 0) {
                            if (lineStrings.length > 1) {
                                geometry.set({type: '', coordinates: []});
                                this.addToolTip()
                            } else if (i > 0 && i < lineStrings.length - 1) {
                                // combine the adjacent lines
                                // Remove the previous line from newLineStrings.
                                var previousLine = newLineStrings.pop();

                                // Replace the points of the next line with starting point of the
                                // previous line and the last point of the next line. This will
                                // trigger directions to be called if snap-to-roads is enabled.
                                var nextLine = lineStrings[i + 1];
                                lineStrings[i + 1] = [previousLine[0], nextLine[nextLine.length - 1]];
                            }
                        } else if (lineString.length == 1) {
                            if (lineStrings.length == 1) {
                                type = 'Point';
                                newLineStrings = lineString[0];
                            }
                        } else {
                            newLineStrings.push(lineString)
                        }
                    } else {
                        newLineStrings.push(lineString)
                    }
                });
                geometry.set({'type': type, 'coordinates': newLineStrings});
                geometry.trigger('change:coordinates');

            } else {
                geometry.set({'type': '', 'coordinates': []});
            }
        },

        addTooltip: function () {
            this.map.on('mousemove', this.addToolTip, this);
        },


        removeTooltip: function () {
            this.map.off('mousemove');
            this.clearDotMarker();
        },

        handleAddPoint: function (event) {
            this. logEvent(event);
            var _this = this;
            var command = new Command();
            command.do = function () {
                _this.addPoint(event);
            };
            var geometry = this.model.get('geometry');
            var coordinates = geometry.get('coordinates');
            var lineIndex = 0;
            if (geometry.get('type') === 'MultiLineString') {
                lineIndex = coordinates.length; // don't subtract one since command.do hasn't executed
            }
            command.undo = function () {
                /* The points in the polyline change when Direction service is called. Setting
                 * a large value then and adjusting it in onMarkerDelete solves that problem.
                 */
                _this.onMarkerDelete({lineIndex: lineIndex, pointIndex: 9999999999});
            };
            command.do();
            this.commands.add(command);
            this.commands.trigger('change');
        },

        onDragEnd: function (event) {
            if (this.dragStartEvent) {
                this.handleMoveMarker(event);
            }
        },

        /**
         * Dragging fires the following events: dragstart, drag (repeadtedly), dragend, click, where click is the final location.
         * The lat lon of click will not necessarily match the lat lon of the drag end, and the no correlation ids exist in the
         * click event indicating it was initiated as a drag. If the mouse is moved off the map, then there is no click event.
         *
         * In order distinguish between a click (add marker) and dragend click (move marker), the ignoreClick flag is added to signify that
         * a drag operation just finished and the next click should be ignored.
         * @param event
         */
        handleMoveMarker: function (event) {
            if (this.dragStartEvent) {
                var latLng;
                if (event.originalEvent) {
                    // Handle click event following drag end (when drag end occurs within map bounds)

                    // Adjust x and y for offset of cursor relative to icon anchor.
                    var x = event.originalEvent.layerX - event.originalEvent.offsetX;
                    var y = event.originalEvent.layerY - event.originalEvent.offsetY;
                    latLng = this.map.containerPointToLatLng(L.point(x, y));
                } else {
                    // Handle drag end event that happens outside of the map bounds
                    // No icon offset is available for dragend events.
                    latLng = event.target._latlng;
                }

                var command = new Command();
                var lineIndex = this.dragStartEvent.lineIndex;
                var pointIndex = this.dragStartEvent.pointIndex;
                var dragStartLatLng = this.dragStartEvent.latLng;
                var _this = this;
                command.do = function () {
                    _this.moveMarker({
                        lineIndex: lineIndex,
                        pointIndex: pointIndex,
                        latLng: latLng
                    });
                };
                command.undo = function () {
                    _this.moveMarker({
                        lineIndex: lineIndex,
                        pointIndex: pointIndex,
                        latLng: dragStartLatLng
                    });
                };
                command.do();
                delete this.dragStartEvent;
                this.commands.add(command);
                this.commands.trigger('change');

            }
        },

        moveMarker: function (event) {
            var lineString;
            var geometry = this.model.get('geometry');
            if (geometry.get('type') === 'Point') {
                geometry.set('coordinates', this.toPointFromLatLng(event.latLng));
            } else if (geometry.get('type') === 'MultiLineString') {
                var lineStrings = geometry.get('coordinates');
                if (lineStrings.length > 0) {
                    lineString = lineStrings[event.lineIndex];
                    lineString[event.pointIndex] = this.toPointFromLatLng(event.latLng);
                    // clear intermediate points to force directions to be refetch.
                    lineStrings[event.lineIndex] = [lineString[0], lineString[lineString.length - 1]];
                    // Adjust adjacent lines
                    if (event.pointIndex === 0 && event.lineIndex > 0) {
                        var previousLine = lineStrings[event.lineIndex - 1];
                        previousLine[previousLine.length - 1] = lineString[event.pointIndex];
                    } else if (event.pointIndex === lineString.length - 1 && event.lineIndex < lineStrings.length - 1) {
                        var nextLine = lineStrings[event.lineIndex + 1];
                        nextLine[0] = lineString[event.pointIndex];
                    }
                    geometry.set('coordinates', lineStrings);
                }
                geometry.trigger('change:coordinates');
            }
        },

        handleMouseout: function (event) {
            this.logEvent(event);
            this.clearDotMarker();
            this.routeTerminusView.handleMouseout();
        },

        logEvent: function (event) {
            if (event && console.log) {
                console.log(event.type);
            }
        },

        addPoint: function (event) {
                var newLineString, lineStrings, newPoint;
                var geometry = this.model.get('geometry');
                var coordinates = geometry.get('coordinates');
                // Clear tooltip after first click.
                if (coordinates.length == 0) {
                    this.removeTooltip();
                }

                if (geometry.get('type') === 'MultiLineString') {
                    // Array of linestrings
                    // which are arrays of points
                    // which are arrays of ordinates
                    lineStrings = geometry.get('coordinates'); // Array of line strings

                    // Get the last point of the last line.
                    var lineString = lineStrings[lineStrings.length - 1]; // get last line of line strings
                    var lastPoint = lineString[lineString.length - 1]; // last point of the last line
                    newPoint = this.toPointFromEvent(event);
                    newLineString = [lastPoint, newPoint]; // Previous point + new point
                    lineStrings.push(newLineString);
                    // Reset the coordinates to trigger coordinates change event.
                    geometry.set({'coordinates': lineStrings});
                    geometry.trigger('change:coordinates');

                } else {
                    // Store the first click as a 'Point'
                    if (coordinates.length == 0) {
                        geometry.set({'type': 'Point', 'coordinates': this.toPointFromEvent(event)});
                    } else {
                        // Convert to 'MultiLineString' on second click.
                        var firstPoint = coordinates;
                        newPoint = this.toPointFromEvent(event);
                        newLineString = [firstPoint, newPoint]; // Array of points in a line string.
                        geometry.set({'type': 'MultiLineString', 'coordinates': [newLineString]});
                    }
                }
        },

        toPointFromEvent: function (event) {
            var latlng;
            if (event.latlng) {
                latlng = event.latlng;
            } else if (event.target && event.target.latlng) {
                latlng = event.target.latlng;
            } else {
                throw new Error("toPointFromEvent: latlng not found in event." + event);
            }
            // lng, lat, distance meters, elevation meters
            return [latlng.lng, latlng.lat, 0, 0];
        },

        toPointFromLatLng: function (latLng) {
            // lng, lat, distance meters, elevation meters
            return [latLng.lng, latLng.lat, 0, 0];
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var $sidepanel = $('#demo_sidepanel');
            var width = $demoBody.width() - $sidepanel.width() - 10;
            var height = $sidepanel.height() - 200;
            var left = $sidepanel.width() + 10;
            $('.detailMap').css({
                top: '5px',
                bottom: '200px',
                left: left + 'px',
                width: width + 'px',
                height: height + 'px'
            });
            $('.detailChart').css({bottom: '0px', left: left + 'px', width: width + 'px', height: '200px'});
        },

        fromMpsToPace: function (metersPerSecond) {
            var minutesPerMile = 26.8224 / Number(metersPerSecond);
            var minutes = Math.floor(minutesPerMile);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            var seconds = Math.floor((minutesPerMile - minutes) * 60);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        },

        onDragStart: function (event) {
            this.dragStartEvent = event;
        },


        onChartMouseOver: function (event) {
            return;  //TODO
            var meters = event.distanceMeters;
            this.clearDotMarker();
            var measurement = this.binarySearch(this.model.get('geometry').get('coordiantes)'), meters);
            if (measurement) {
                var lat = measurement.get('lat');
                var lng = measurement.get('lon');
                var latLng = L.latLng(lat, lng);
                this.dotMarker = L.marker(latLng, {icon: new this.smallIcon()}).addTo(this.map);

                // Create three markers and set their icons to cssIcon
                var json = {
                    distance: Math.round(measurement.get('distanceMeters') * this.metersToMiles * 100) / 100,
                    pace: this.fromMpsToPace(measurement.get('metersPerSecond')),
                    heartRate: measurement.get('heartRate')
                };
                var cssIcon = L.divIcon({
                    // Specify a class name we can refer to in CSS.
                    className: 'css-icon',
                    // Set marker width and height
                    iconAnchor: [150, 30],
                    iconSize: [130, 60],
                    html: this.infoTemplate(json)
                });
                this.bullseyeLabel = L.marker(latLng, {icon: cssIcon}).addTo(this.map);
            }
        },

        onChartMouseOut: function () {
            this.clearDotMarker();
        },

        clearDotMarker: function () {
            if (this.bullseyeLabel) {
                this.map.removeLayer(this.bullseyeLabel);
                delete this.bullseyeLabel;
            }
            if (this.dotMarker) {
                this.map.removeLayer(this.dotMarker);
                delete this.dotMarker;
            }
        },

        binarySearch: function (measures, meters) {
            var mid, distanceMeters;
            var lo = -1, hi = measures.length;
            while (hi - lo > 1) {
                mid = Math.round((lo + hi) / 2);
                distanceMeters = measures[mid].get('distanceMeters');
                if (distanceMeters <= meters) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }

            var prev, next;
            if (lo > -1 && lo < measures.length) {
                prev = measures[lo];
            }
            if (hi > -1 && hi < measures.length) {
                next = measures[hi];
            }
            // Return null if nothing was found.
            if (!prev && !next) {
                return null;
            }

            // Return prev if it equals the specified distance or next is not defined
            if (prev && (prev.get(distanceMeters) == meters || !next)) {
                return prev;
            }

            // Return next if it equals the specified distance or prev is not defined
            if (next && (next.get(distanceMeters) == meters || !prev)) {
                return next;
            }

            // Return prev or next, whichever is closest to the specified distance.
            // (NOTE: this is where one could project a point in between the two if the gaps were large)
            if (Math.abs(next.get(distanceMeters) - meters) < Math.abs(prev.get(distanceMeters) - meters)) {
                return next;
            }
            return prev;
        },

        destroy: function () {
            if (this.routePropertiesView) {
                this.routePropertiesView.destroy();
                delete this.routePropertiesView;
            }
            if (this.RouteControlsView) {
                this.RouteControlsView.destroy();
                delete this.RouteControlsView;
            }
            if (this.elevationChartView) {
                this.elevationChartView.destroy();
                delete this.elevationChartView;
            }
            if (this.MapLocationControlView) {
                this.MapLocationControlView.destroy();
                delete this.MapLocationControlView;
            }
            if (this.routeTerminusView) {
                this.routeTerminusView.destroy();
                delete this.routeTerminusView;
            }
            if (this.routeLinesView) {
                this.routeLinesView.destroy();
                delete this.routeLinesView;
            }
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 11;
        }

    });

    return Demo11PageView;
});
