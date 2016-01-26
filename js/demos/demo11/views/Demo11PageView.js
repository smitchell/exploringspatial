define(function(require) {
    "use strict";
    var $                      = require('jquery'),
        _                      = require('underscore'),
        Backbone               = require('backbone'),
        L                      = require('leaflet'),
        MapEventDispatcher     = require('apps/MapEventDispatcher'),
        Feature                = require('models/Feature'),
        Command                = require('models/Command'),
        LineRouter             = require('utils/LineRouter'),
        RouteManager           = require('utils/RouteManager'),
        Commands               = require('collections/Commands'),
        MapLocationControlView = require('demos/demo11/views/MapLocationControlView'),
        RoutePropertiesView    = require('demos/demo11/views/RoutePropertiesView'),
        RouteControlsView      = require('demos/demo11/views/RouteControlsView'),
        ElevationChartView     = require('demos/demo11/views/ElevationChartView'),
        RouteTerminusView      = require('demos/demo11/views/RouteTerminusView'),
        RouteLinesView         = require('demos/demo11/views/RouteLinesView'),
        templateHtml           = require('text!demos/demo11/templates/Demo11PageView.html');
        require('leaflet_google');
        require('leaflet_active_layers');

     var Demo11PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.metersToMiles = 0.000621371;
            this.dispatcher = MapEventDispatcher;
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOVER, this.onChartMouseOver, this);
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOUT, this.onChartMouseOut, this);
            this.dispatcher.on(this.dispatcher.Events.DRAG_START, this.onDragStart, this);
            this.dispatcher.on(this.dispatcher.Events.DRAGGING, this.onDragging, this);
            this.dispatcher.on(this.dispatcher.Events.DRAG_END, this.onDragEnd, this);
            this.dispatcher.on(this.dispatcher.Events.MARKER_DELETE, this.handleMarkerDelete, this);
            this.routeManager = new RouteManager();
            this.model = new Feature();
            this.model.get('properties').set('name', '');
            this.model.get('properties').set('meters', 0);
            this.smallIcon = L.Icon.extend({
                options: {
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    iconUrl: 'media/bullseye_16x16.png'
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
            var geometry = this.model.get('geometry');
            this.listenTo(geometry, 'change:coordinates', this.onCoordinatesChanged);
            this.render();
        },

        render: function () {
            this.$el.html(this.template({model: this.model.get('properties').toJSON()}));
            // Render map
            this.sizeMaps();
            var googleLayer = new L.Google('ROADMAP');
            var osmLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
            var mapquestLink = '<a href="http://www.mapquest.com//">MapQuest</a>';
            var mapquestPic = '<img src="http://developer.mapquest.com/content/osm/mq_logo.png">';
            var mapQuestLayer = L.tileLayer(
                'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                  attribution: '&copy; ' + mapLink + '. Tiles courtesy of ' + mapquestLink + mapquestPic,
                  maxZoom: 18,
                  subdomains: '1234'
                });
            this.map = L.map('map_container').setView({lat: 38.974974, lng: -94.657152}, 14);

            this.map.addLayer(mapQuestLayer);
            var baseLayers = {
                'Google': googleLayer,
                'OSM': osmLayer,
                'MapQuest': mapQuestLayer
            };
            var activeLayers = L.control.activeLayers(baseLayers).addTo(this.map);
            this.lineRouter = new LineRouter({dispatcher: this.dispatcher, transitMode: LineRouter.TRANSIT_MODE_BICYCLING, activeLayers: activeLayers});
            this.MapLocationControlView = new MapLocationControlView({
                map: this.map,
                model: this.model,
                activeLayers: activeLayers,
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
                lineRouter: this.lineRouter,
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

            var self = this;
            this.map.on('click', self.handleAddPoint, this);
            this.map.on('mouseout', self.handleMouseout, this);
            var geometry = this.model.get('geometry');
            var $mapContainer = $('#map_container');
            $mapContainer.css('cursor', 'crosshair');
            if (!geometry.get('type') || geometry.get('coordinates').length == 0) {
                // Add getting started tooltip
                this.enableToolTip();
            } else {
                $mapContainer.css('cursor', '');
            }
            this.rubberBandLayer = L.layerGroup().addTo(this.map);
            this.lineControlLayer = L.layerGroup().addTo(this.map);
            this.routeTerminusView = new RouteTerminusView({
                map: this.map,
                model: geometry,
                dispatcher: this.dispatcher,
                rubberBandLayer: this.rubberBandLayer
            });
            this.routeLinesView = new RouteLinesView({
                map: this.map,
                model: this.model,
                dispatcher: this.dispatcher,
                snapToRoads: this.snapToRoads,
                lineRouter: this.lineRouter,
                routeManager: this.routeManager,
                activeLayers: activeLayers,
                rubberBandLayer: this.rubberBandLayer,
                lineControlLayer: this.lineControlLayer
            });
        },

         onCoordinatesChanged: function() {
             var geometry = this.model.get('geometry');
             // Clear tooltip after first click.
             // (before first click, type is "", it becomes "Point" when first point is added, after that it is "MultiLineString."
             var type = geometry.get('type');
             if (type === 'Point') {
                 this.disableTooltip();
             } else if (type === ''){
                 this.enableToolTip()
             }
         },

        addToolTip: function (event) {
            this.clearToolTip();
            if (event.latlng) {
                this.toolTip = L.marker(event.latlng, {
                    icon: this.toolTipCssIcon
                }).addTo(this.map);
            }
        },

         enableToolTip: function () {
             this.map.on('mousemove', this.addToolTip, this);
         },


         disableTooltip: function () {
             this.map.off('mousemove');
             this.clearToolTip();
         },

         clearToolTip: function () {
             if (this.toolTip) {
                 this.map.removeLayer(this.toolTip);
                 delete this.toolTip;
             }
         },


         handleMarkerDelete: function(args) {
             var self = this;

             var command = new Command();
             var geometry = this.model.get('geometry');
             var coordinates = geometry.get('coordinates');
             var originalType = geometry.get('type');
             var originalCoordinates = coordinates.slice(0);
             var lineIndex = args.lineIndex;
             var pointIndex = args.pointIndex;
             command.do = function () {
                 self.routeManager.deleteMarker({
                     lineIndex: lineIndex,
                     pointIndex: pointIndex,
                     geometry: geometry
                 });
             };

             command.undo = function () {
                 geometry.set({'type': originalType});
                 geometry.set({'coordinates': originalCoordinates});
                 geometry.trigger('change:coordinates');
             };
             command.do();
             this.commands.add(command);
             this.commands.trigger('change');
         },

        handleAddPoint: function (event) {
            var self = this;
            var geometry = this.model.get('geometry');
           var coordinates = geometry.get('coordinates');
           var originalType = geometry.get('type');
           var originalCoordinates = coordinates.slice(0);
           var lineIndex = 0;
            var command = new Command();
            command.do = function () {
                self.routeManager.addPoint({
                    point: self.toPointFromEvent(event),
                    geometry: geometry
                });
            };

            if (geometry.get('type') === 'MultiLineString') {
                lineIndex = coordinates.length; // don't subtract one since command.do hasn't executed
            }
            command.undo = function () {
                geometry.set({'type': originalType});
                geometry.set({'coordinates': originalCoordinates});
                geometry.trigger('change:coordinates');
            };
            command.do();
            this.commands.add(command);
            this.commands.trigger('change');
        },

         onDragging: function(args) {
             var lineIndex = args.lineIndex;
             var dragPosition = args.dragPosition;
             var latLng = args.latLng;
             var geometry = this.model.get('geometry');
             if (geometry.get('type') === 'MultiLineString') {
                 var lineStrings = geometry.get('coordinates');
                 var lineString, previousPoint, nextPoint;
                 lineString = lineStrings[lineIndex];
                 var lineStyle = { color: '#808080', weight: '2', dashArray: "1, 5"};
                 if (dragPosition === 'start' ) {
                     lineString = lineStrings[lineIndex];
                     nextPoint = lineString[lineString.length - 1];
                     L.polyline([latLng, L.latLng(nextPoint[1], nextPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                     if (lineIndex > 0) {
                         lineString = lineStrings[lineIndex - 1];
                         previousPoint = lineString[0];
                         L.polyline([latLng, L.latLng(previousPoint[1], previousPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                     }
                 } else if (dragPosition === 'end' ){
                     lineString = lineStrings[lineIndex];
                     previousPoint = lineString[0];
                     L.polyline([latLng, L.latLng(previousPoint[1], previousPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                     if (lineIndex < lineStrings.length - 1) {
                         lineString = lineStrings[lineIndex + 1];
                         nextPoint = lineString[lineString.length - 1];
                         L.polyline([latLng, L.latLng(nextPoint[1], nextPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                     }
                 } else if (dragPosition === 'middle' ){
                      lineString = lineStrings[lineIndex];
                      previousPoint = lineString[0];
                      L.polyline([latLng, L.latLng(previousPoint[1], previousPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                      nextPoint = lineString[lineString.length - 1];
                      L.polyline([latLng, L.latLng(nextPoint[1], nextPoint[0])], lineStyle).addTo(this.rubberBandLayer);
                  }
             }
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
         * In order distinguish between a click (add marker) and dragend click (move marker), we test for the presence of event.originalEvent.
         * @param event
         */
        handleMoveMarker: function (event) {
            if (this.dragStartEvent) {
                var latLng;
                if (event.originalEvent) {
                    // Handle drag that ended with the map viewport.

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
                var dragPosition = this.dragStartEvent.dragPosition;
                var dragStartLatLng = this.dragStartEvent.latLng;
                var geometry = this.model.get('geometry');
                var coordinates = geometry.get('coordinates');
                var originalCoordinates = coordinates.slice(0);
                var self = this;
                command.do = function () {
                    self.routeManager.moveMarker({
                        lineIndex: lineIndex,
                        dragPosition: dragPosition,
                        latLng: latLng,
                        point: self.toPointFromLatLng(latLng),
                        geometry: geometry,
                        zoom: self.map.getZoom()
                    });

                };
                command.undo = function () {
                    var originalLine = originalCoordinates[lineIndex];
                    if (dragPosition == 'start') {
                        originalCoordinates[lineIndex] = [[dragStartLatLng.lng, dragStartLatLng.lat, 0, 0], originalLine[originalLine.length - 1]];
                    } else if (dragPosition == 'end') {
                        originalCoordinates[lineIndex] = [originalLine[0], [dragStartLatLng.lng, dragStartLatLng.lat, 0, 0]];
                    }
                    geometry.set({'coordinates': originalCoordinates});
                    geometry.trigger('change:coordinates');
                };
                command.do();
                delete this.dragStartEvent;
                this.commands.add(command);
                this.commands.trigger('change');
            }
        },

        handleMouseout: function (event) {
            this.clearDotMarker();
            this.routeTerminusView.handleMouseout();
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
