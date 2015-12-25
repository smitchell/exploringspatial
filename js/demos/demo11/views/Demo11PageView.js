define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'models/Location',
    'models/GoogleGeoCoder',
    'collections/ActivityMeasurements',
    'demos/demo11/views/ElevationChartView',
    'text!demos/demo11/templates/Demo11PageView.html'
], function ($, _, Backbone, MapEventDispatcher, Location, GoogleGeoCoder, ActivityMeasurements, ElevationChartView, templateHtml) {
    var Demo11PageView = Backbone.View.extend({

        events: {
            'click #location a': 'changeLocation',
            'keypress #location': 'searchOnEnter'
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
            // listen for location changes from the map search view.
            this.location.on('sync', this.syncMapLocation, this);
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            // Render map
            this.sizeMaps();
            this.map = L.map('map_container').addLayer( new L.Google('ROADMAP'));
            this.location.set({lat: 39.097836, lon: -94.581642, zoom: 16 }, {silent: true});
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
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var $sidepanel = $('#demo_sidepanel');
            var width = $demoBody.width() - $sidepanel.width() - 30;
            var height = $sidepanel.height() - 215;
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
            minutes = Math.floor(minutesPerMile);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            seconds = Math.floor((minutesPerMile - minutes) * 60);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        },


        onChartMouseOver: function (event) {
            var meters = event.distanceMeters;
            this.clearDotMarker();
            var measurement = this.binarySearch(this.activityMeasurements.models, meters);
            if (measurement) {
                var lat = measurement.get('lat');
                var lng = measurement.get('lon');
                var latLng = L.latLng(lat, lng);
                this.dotMarker = L.marker(latLng, {icon: new this.smallIcon()}).addTo(this.map);

                // Create three markers and set their icons to cssIcon
                var json = {
                    distance: Math.round(measurement.get('distanceMeters') * this.metersToMiles * 100)/100,
                    pace: this.fromMpsToPace(measurement.get('metersPerSecond')),
                    heartRate:  measurement.get('heartRate')
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

        changeLocation: function (location) {

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
                     $searchButton.removeClass('searching');
                     $('.location').val('');
                 },
                 error: function (object, xhr, options) {
                     if (console.log && xhr && xhr.responseText) {
                         console.log(xhr.status + " " + xhr.responseText);
                     }
                 }
             });
         },

        syncMapLocation: function() {
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
