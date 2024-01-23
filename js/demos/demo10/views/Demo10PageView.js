define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'models/Activity',
    'demos/demo10/views/ElevationChartView',
    'demos/demo10/views/HotlineControlsView',
    'text!demos/demo10/templates/Demo10PageView.html',
    'text!demos/demo10/templates/Infobox.html',
    'leaflet_hotline'
], function ($, _, Backbone, MapEventDispatcher, Activity, ElevationChartView, HotlineControlsView, templateHtml, infoTemplateHtml) {
    var Demo10PageView = Backbone.View.extend({

        events: {
            'click .gradientMenu a': 'updateMetric'
        },

        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        initialize: function () {
            this.template = _.template(templateHtml);
            this.infoTemplate = _.template(infoTemplateHtml);
            this.fetchData();
            this.isPace = true;
            this.smallIcon = L.Icon.extend({
                options: {
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    iconUrl: 'media/bullseye_16x16.png'
                }
            });
            this.metersToMiles = 0.000621371;
            this.dispatcher = MapEventDispatcher;
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOVER, this.onChartMouseOver, this);
            this.dispatcher.on(this.dispatcher.Events.CHART_MOUSEOUT, this.onChartMouseOut, this);
            this.dispatcher.on(this.dispatcher.Events.CHANGE_STYLE, this.onChangeHotlineStyle, this);
        },

        /**
         * Fetch any needed data here.
         */
        fetchData: function () {
            var activityId = 143414934;
            this.activity = new Activity({'activityId': activityId});
            this.activity.urlRoot = 'http://data.byteworksinc.com/measurements/';
            var self = this;
            this.activity.fetch({
                success: function () {
                    self.render();
                },
                error: function (object, xhr, options) {
                    self.loading -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            // Create JSON to render html.
            var model = this.createModelJson(this.activity);
            var json;
            if (this.isPace) {
                json = this.generateSpeedJson(model);
            } else {
                json = this.generateHeartRateJson(model);
            }
            if (this.hotlineControlsView) {
                this.hotlineControlsView.render();
            } else {
                this.hotlineControlsView = new HotlineControlsView({el: this.$el, dispatcher: this.dispatcher, rangeMultiplier: this.rangeMultiplier});
            }
            json.model = model;
            this.$el.html(this.template(json));
            if (this.isPace) {
                $('.heartRate').removeClass('YouAreHere');
                $('.pace').addClass('YouAreHere');
            } else {
                $('.heartRate').addClass('YouAreHere');
                $('.pace').removeClass('YouAreHere');
            }

            // Render map
            var bbox = this.activity.get('properties').get('bbox');
            var southWest = L.latLng(bbox[1], bbox[0]),
                northEast = L.latLng(bbox[3], bbox[2]),
                bounds = L.latLngBounds(southWest, northEast);
            this.sizeMaps();
            this.map = L.map('map_container').fitBounds(bounds);

            L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(this.map);

            // Render hotline.
            var options = {
                min: json.rangeMinValue,
                max: json.rangeMaxValue,
                palette: {
                    0.0: json.paletteColor1,
                    0.5: json.paletteColor2,
                    1.0: json.paletteColor3
                },
                weight: model.weight,
                outlineColor: model.outlineColor,
                outlineWidth: model.outlineWidth
            };
            // Produce data for hotline.
            var data;
            var coordiantes = this.activity.get('geometry').get('coordinates');
            if (this.isPace) {
                data = this.generateSpeedData(coordiantes);
            } else {
                data = this.generateHeartRateData(coordiantes);
            }
            this.hotlineLayer = L.hotline(data, options).addTo(this.map);
            var marker;
            this.hotlineLayer.on('mouseover', function (event) {
                if (marker) {
                    marker.remove(map)
                }
                marker = L.marker(event.latlng).addTo(map);
            });
            this.map.fitBounds(this.hotlineLayer.getBounds(), {padding: [16, 16]});
            if (this.elevationChartView) {
                this.elevationChartView.render();
            } else {
                this.elevationChartView = new ElevationChartView({
                    el: this.$('#chart'),
                    collection: coordiantes,
                    dispatcher: this.dispatcher
                });
            }
        },

        createModelJson: function (activity) {
            var model = activity.toJSON().properties;
            model.activityId = activity.get('activityId');
            var totalMeters = activity.get('properties').get('totalMeters');
            var totalSeconds = activity.get('properties').get('totalSeconds');
            model.distance = Math.round(totalMeters * this.metersToMiles * 10) / 10;
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = (totalSeconds - (minutes * 60));
            model.time = minutes + ":" + seconds;
            var metersPerSecond = totalMeters / totalSeconds;
            model.pace = this.fromMpsToPace(metersPerSecond);
            var date = new Date(this.activity.get('properties').get('startTime'));
            model.date = this.months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            return model;
        },

        generateSpeedData: function (coordinates) {
            var lat, lng, speed;
            var data = [];
            var self = this;
            var latIndex = this.activity.getMetricIndex('lat');
            var lonIndex = this.activity.getMetricIndex('lon');
            var speedIndex = this.activity.getMetricIndex('metersPerSecond');
            $.each(coordinates, function (i, coordinate) {
                lat = coordinate[latIndex];
                lng = coordinate[lonIndex];
                speed = coordinate[speedIndex];
                if (lat && lng && speed) {
                    data.push([lat, lng, speed * self.rangeMultiplier]);
                }
            });
            return data;
        },

        generateHeartRateData: function (coordinates) {
            var lat, lng, bpm;
            var data = [];
            var latIndex = this.activity.getMetricIndex('lat');
            var lonIndex = this.activity.getMetricIndex('lon');
            var bpmIndex = this.activity.getMetricIndex('heartRate');
            $.each(coordinates, function (i, coordinate) {
                lat = coordinate[latIndex];
                lng = coordinate[lonIndex];
                bpm = coordinate[bpmIndex];
                if (lat && lng && bpm) {
                    data.push([lat, lng, bpm]);
                }
            });
            return data;
        },

        generateSpeedJson: function () {
            // The slider doesn't work will with meters per second, so use a bigger number.
            this.rangeMultiplier = 100;
            var json = {};
            json.outlineColor = '#000000';
            json.paletteColor1 = '#ff0000';
            json.paletteColor2 = '#ffff00';
            json.paletteColor3 = '#008800';

            var minMetersPerSecond = 3.3528;  // 8:00 min/mi
            var maxMetersPerSecond = 3.57632; // 7:30 min/mi
            json.rangeMinValue = minMetersPerSecond * this.rangeMultiplier;  // 8:00 min/mi
            json.rangeMaxValue = maxMetersPerSecond * this.rangeMultiplier; // 7:30 min/mi
            json.rangeUnits = '(min/mi)';
            json.minValue = this.fromMpsToPace(minMetersPerSecond);
            json.maxValue = this.fromMpsToPace(maxMetersPerSecond);
            json.minLower = this.rangeMultiplier;
            json.minUpper = 5 * this.rangeMultiplier;
            json.maxLower = this.rangeMultiplier;
            json.maxUpper = 5 * this.rangeMultiplier;
            json.outlineWidth = 1;
            json.weight = 5;
            json.smoothFactor = 1;
            return json;
        },

        generateHeartRateJson: function () {
            this.rangeMultiplier = 1;
            var json = {};
            json.outlineColor = '#000000';
            json.paletteColor3 = '#ff0000';
            json.paletteColor2 = '#ffff00';
            json.paletteColor1 = '#008800';
            json.rangeMinValue = 176;
            json.rangeMaxValue = 180;
            json.rangeUnits = 'bpm';
            json.minValue = json.rangeMinValue;
            json.maxValue = json.rangeMaxValue;
            json.minLower = 70;
            json.minUpper = 200;
            json.maxLower = 70;
            json.maxUpper = 200;
            json.outlineWidth = 1;
            json.weight = 5;
            json.smoothFactor = 1;
            return json;
        },

        onChangeHotlineStyle: function (event) {
            this.hotlineLayer.setStyle(event.style).redraw();
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var $sidepanel = $('#demo_sidepanel');
            var width = $demoBody.width() - $sidepanel.width() - 15;
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

        updateMetric: function (event) {
            var $pace = $('.pace');
            var $heartRate = $('.heartRate');
            this.isPace = $heartRate.hasClass('YouAreHere');
            $pace.toggleClass('YouAreHere');
            $heartRate.toggleClass('YouAreHere');
            this.render();
        },

        onChartMouseOver: function (event) {
            var meters = event.distanceMeters;
            this.clearDotMarker();
            var measurement = this.binarySearch(this.activity.get('geometry').get('coordinates'), meters);
            var latIndex = this.activity.getMetricIndex('lat');
            var lonIndex = this.activity.getMetricIndex('lon');
            var distIndex = this.activity.getMetricIndex('distMeters');
            var speedIndex = this.activity.getMetricIndex('metersPerSecond');
            var hrIndex = this.activity.getMetricIndex('heartRate');
            if (measurement) {
                var lat = measurement[latIndex];
                var lng =measurement[lonIndex];
                var latLng = L.latLng(lat, lng);
                this.dotMarker = L.marker(latLng, {icon: new this.smallIcon()}).addTo(this.map);

                // Create three markers and set their icons to cssIcon
                var json = {
                    distance: Math.round(measurement[distIndex] * this.metersToMiles * 100) / 100,
                    pace: this.fromMpsToPace(measurement[speedIndex]),
                    heartRate: measurement[hrIndex]
                };
                var cssIcon = L.divIcon({
                    // Specify a class name we can refer to in CSS.
                    className: 'css-icon',
                    // Set marker width and height
                    iconAnchor: [155, 32],
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
            var distIndex = this.activity.getMetricIndex('distMeters');
            var mid, distanceMeters;
            var lo = -1, hi = measures.length;
            while (hi - lo > 1) {
                mid = Math.round((lo + hi) / 2);
                distanceMeters = measures[mid][distIndex];
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
            if (prev && (prev[distIndex] == meters || !next)) {
                return prev;
            }

            // Return next if it equals the specified distance or prev is not defined
            if (next && (next[distIndex] == meters || !prev)) {
                return next;
            }

            // Return prev or next, whichever is closest to the specified distance.
            // (NOTE: this is where one could project a point in between the two if the gaps were large)
            if (Math.abs(next[distIndex] - meters) < Math.abs(prev[distIndex] - meters)) {
                return next;
            }
            return prev;
        },

        destroy: function () {
            if (this.hotlineControlsView) {
                this.hotlineControlsView.destroy();
            }
            if (this.elevationChartView) {
                this.elevationChartView.destroy();
            }
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 10;
        }

    });

    return Demo10PageView;
});
