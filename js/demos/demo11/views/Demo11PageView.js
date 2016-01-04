"use strict";
define([
    'jquery',
    'underscore',
    'backbone',
    'leaflet',
    'apps/MapEventDispatcher',
    'models/Location',
    'models/GoogleGeoCoder',
    'models/Feature',
    'models/Command',
    'collections/Commands',
    'demos/demo11/views/ElevationChartView',
    'demos/demo11/views/RouteTerminusView',
    'demos/demo11/views/RouteLinesView',
    'text!demos/demo11/templates/Demo11PageView.html'
], function ($, _, Backbone, L, MapEventDispatcher, Location, GoogleGeoCoder, Feature, Command, Commands, ElevationChartView, RouteTerminusView, RouteLinesView, templateHtml) {
    var Demo11PageView = Backbone.View.extend({

        events: {
            'click .location a': 'changeLocation',
            'keypress #location': 'searchOnEnter',
            'click .undo a': 'handleUndo',
            'keypress .undo a': 'handleUndo',
            'click .reset a': 'handleReset',
            'keypress .reset a': 'handleReset',
            'change #snapToRoads': 'toggleSnapToRoads'
        },

        initialize: function () {
            this.template = _.template(templateHtml);
            this.location = new Location();
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
            // listen for location changes from the map search view.
            this.location.on('sync', this.syncMapLocation, this);
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
            this.commands.on('change', this.commandChanged, this);
            this.snapToRoads = true;
            this.render();
        },

        render: function () {
            var properties = this.model.get('properties').toJSON();
            properties.distance = properties.meters * this.metersToMiles;
            properties.snapToRoads = this.snapToRoads ? 'checked' : '';
            this.$el.html(this.template({model: properties}));
            // Render map
            this.sizeMaps();
            this.map = L.map('map_container').addLayer(new L.Google('ROADMAP'));
            this.location.set({lat: 38.974974, lon: -94.657152, zoom: 16}, {silent: true});
            this.geoJsonLayer = L.geoJson().addTo(this.map);
            this.syncMapLocation(); // Uses this.location to pan/zoom the map.
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
                model: geometry,
                dispatcher: this.dispatcher,
                snapToRoads: this.snapToRoads
            });
        },

        addToolTip: function (event) {
            this.clearDotMarker();
            if (event.latlng) {
                this.bullseyeLabel = L.marker(event.latlng, {icon: this.toolTipCssIcon}).addTo(this.map);
            }
        },

        removeLastPoint: function (event) {
            var geometry = this.model.get('geometry');
            var coordinates, newLineString, lineStrings;
            if (geometry.get('type') === 'MultiLineString') {
                lineStrings = geometry.get('coordinates'); // Array of line strings

                // Get the last point of the last line.
                var lineString = lineStrings.pop(); // get last line of line strings
                lineString.pop(); // remove the last point
                if (lineString.length > 1) {
                    lineStrings.push(lineString);
                }
                if (lineStrings.length > 0) {
                    geometry.set({'coordinates': lineStrings});
                } else if (lineString.length > 0) {
                    geometry.set({type: 'Point', coordinates: lineString[0]});
                } else {
                    geometry.set({type: '', coordinates: []});
                    this.addToolTip();
                }
                // TODO - Find out why this was necessary
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

            if (this.dragStartEvent) {
                this.handleMoveMarker(event);
            } else {
                var _this = this;
                var command = new Command();
                command.do = function () {
                    _this.addPoint(event);
                };
                command.undo = function () {
                    _this.removeLastPoint();
                };
                command.do();
                this.commands.add(command);
                this.commands.trigger('change');
            }
        },

        onDragEnd: function (event) {
            if (this.dragStartEvent) {
                /*
                 * onDragEnd should be ignored if the event is on the map, because the final locations comes in a
                 * subsequet click event. If the dragend happens off the map, then the click event never occurs.
                 * If that case, we need to call handleMoveMarker to complete the move using the drag end location.
                 */
                if (!this.map.getBounds().contains(event.target._latlng)) {
                    this.handleMoveMarker(event);
                }
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
                this.commands.add(command);
                this.commands.trigger('change');
                delete this.dragStartEvent;
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

        handleReset: function () {
            if (confirm('Are you sure that you want remove everything from the map?')) {
                this.commands.reset([]);
                var geometry = this.model.get('geometry');
                geometry.set({type: '', coordinates: []});
                this.commands.trigger('change');
            }
        },

        handleUndo: function () {
            var command = this.commands.pop();
            if (command) {
                command.undo();
            }
            this.commands.trigger('change');
        },

        addPoint: function (event) {
            var coordinates, newLineString, lineStrings;
            var geometry = this.model.get('geometry');
            // Clear tooltip after first click.
            if (geometry.get('coordinates').length === 0) {
                this.removeTooltip();
            }

            if (geometry.get('type') === 'MultiLineString') {
                // Array of linestrings
                // which are arrays of points
                // which are arrays of ordinates
                lineStrings = geometry.get('coordinates'); // Array of line strings

                // Get the last point of the last line.
                var lineString = lineStrings[lineStrings.length - 1]; // get last line of line strings
                var lastPoint = lineString[lineString.length - 1]; // last point of the list line
                newLineString = [lastPoint, this.toPointFromEvent(event)]; // Previous point + new point
                lineStrings.push(newLineString);
                // Reset the coordinates to trigger coordinates change event.
                geometry.set({'coordinates': lineStrings});
                geometry.trigger('change:coordinates');

            } else {
                // Store the first click as a 'Point'
                if (geometry.get('coordinates').length == 0) {
                    geometry.set({'type': 'Point', 'coordinates': this.toPointFromEvent(event)});
                } else {
                    // Convert to 'MultiLineString' on second click.
                    var firstPoint = geometry.get('coordinates');
                    newLineString = [firstPoint, this.toPointFromEvent(event)]; // Array of points in a line string.
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
            return [latlng.lng, latlng.lat, 0, 0];
        },

        toPointFromLatLng: function (latLng) {
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

        changeLocation: function () {
            var location = this.$('#location').val().trim();
            if (location.length < 3) {
                return;
            }

            // Throw out things that don't belong in a keyword search.
            location = this.scrubInput(location);

            var geoCoder = new GoogleGeoCoder();

            // Clear the previous search results
            geoCoder.clear({silent: true});

            // Execute the search. If the query is successful the MapView will be notified
            // because it is bound to the Location model sync event.
            geoCoder.set('query', location);
            var _self = this;
            geoCoder.fetch({
                success: function () {
                    _self.location.set(geoCoder.toJSON());
                    _self.location.trigger('sync');
                },
                complete: function () {
                    $('.location').val('');
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        syncMapLocation: function () {
            if (this.location != null) {
                var lat = this.location.get('lat');
                var lon = this.location.get('lon');
                var zoom = 10;
                if (this.location.get('zoom') != null) {
                    zoom = this.location.get('zoom');
                }
                if (lat != null && lon != null) {
                    var center = L.latLng(lat, lon);
                    this.map.setView(center, zoom);
                }
            }
        },

        searchOnEnter: function (e) {
            if (e.keyCode != 13) {
                return;
            }
            this.changeLocation();
        },

        scrubInput: function (value) {
            var scrubbed = '';
            if (typeof value != 'undefined' && value != null) {
                scrubbed = value.trim();
                if (scrubbed.length > 0) {
                    scrubbed = scrubbed.split('<').join('');
                    scrubbed = scrubbed.split('>').join('');
                }
            }
            return scrubbed;
        },

        commandChanged: function () {
            if (this.commands.length > 0) {
                this.$('.undo').show();
                this.$('.reset').show();
            } else {
                this.$('.undo').hide();
                this.$('.reset').hide();
                this.addTooltip();
            }
        },

        toggleSnapToRoads: function () {
            this.snapToRoads = $('#snapToRoads').is(':checked');
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_SNAP_TO_ROAD, {
                snapToRoads: this.snapToRoads
            });
        },


        destroy: function () {
            if (this.elevationChartView) {
                this.elevationChartView.destroy();
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
