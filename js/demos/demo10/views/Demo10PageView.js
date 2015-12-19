define([
    'jquery',
    'underscore',
    'backbone',
    'highcharts',
    'models/Activity',
    'collections/ActivityMeasurements',
    'text!demos/demo10/templates/Demo10PageView.html',
    'leaflet_hotline'
], function ($, _, Backbone, highcharts, Activity, ActivityMeasurements, templateHtml) {
    var Demo10PageView = Backbone.View.extend({

        events: {
            'input .paletteColor': 'updatePalette',
            'input #outlineColor': 'updateOutlineColor',
            'input .styleControl': 'updateStyle',
            'click .gradientMenu a': 'updateMetric'
        },

        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
            this.isPace = true;
        },

        /**
         * Fetch any needed data here.
         */
        fetchData: function () {
            var activityId = 143414934;
            this.activity = new Activity({'activityId': activityId});
            var _this = this;
            this.loading = 2;
            this.activity.fetch({
                success: function () {
                    _this.loading -= 1;
                    _this.checkCompleted();
                },
                error: function (object, xhr, options) {
                    _this.loading -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
            this.activityMeasurements = new ActivityMeasurements();
            this.activityMeasurements.setActivityId(activityId);
            this.activityMeasurements.fetch({
                success: function () {
                    _this.loading -= 1;
                    _this.checkCompleted();
                },
                error: function (object, xhr, options) {
                    _this.loading -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        checkCompleted: function () {
            if (this.loading < 1) {
                this.render();
            }
        },

        render: function () {
            // Create JSON to render html.
            var model = this.createModelJson(this.activity);
            if (this.isPace) {
                json = this.generateSpeedJson(model);
            } else {
                json = this.generateHeartRateJson(model);
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
            var properties = this.activity.get('properties');
            var minLat = properties.get('minLat');
            var minLon = properties.get('minLon');
            var maxLat = properties.get('maxLat');
            var maxLon = properties.get('maxLon');
            this.sizeMaps();
            this.startLat = (minLat + maxLat) / 2;
            this.startLon = (minLon + maxLon) / 2;
            this.map = L.map('map_container', {
                center: [this.startLat, this.startLon],
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: true,
                dragging: true,
                keyboard: false
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));

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
            if (this.isPace) {
                data = this.generateSpeedData(this.activityMeasurements);
            } else {
                data = this.generateHeartRateData(this.activityMeasurements);
            }
            this.hotlineLayer = L.hotline(data, options).addTo(this.map);

            this.map.fitBounds(this.hotlineLayer.getBounds(), {padding: [16, 16]});

            this.chart = this.createChart(this.activity, this.activityMeasurements);
        },

        createModelJson: function (activity) {
            var model = activity.toJSON().properties;
            model.activityId = activity.get('activityId');
            var totalMeters = activity.get('properties').get('totalMeters');
            var totalSeconds = activity.get('properties').get('totalSeconds');
            model.distance = Math.round(totalMeters * 0.000621371 * 10) / 10;
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = (totalSeconds - (minutes * 60));
            model.time = minutes + ":" + seconds;
            var metersPerSecond = totalMeters / totalSeconds;
            model.pace = this.fromMpsToPace(metersPerSecond);
            var date = new Date(this.activity.get('properties').get('startTime'));
            model.date = this.months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            return model;
        },

        generateSpeedData: function (activityMeasurements) {
            var lat, lng, speed;
            var data = [];
            var _this = this;
            activityMeasurements.each(function (activityMeasurement) {
                lat = activityMeasurement.get("lat");
                lng = activityMeasurement.get("lon");
                speed = activityMeasurement.get("metersPerSecond");
                if (lat && lng && speed) {
                    data.push([lat, lng, speed * _this.rangeMultiplier]);
                }
            });
            return data;
        },

        generateHeartRateData: function (activityMeasurements) {
            var lat, lng, bpm;
            var data = [];
            var _this = this;
            activityMeasurements.each(function (activityMeasurement) {
                lat = activityMeasurement.get("lat");
                lng = activityMeasurement.get("lon");
                bpm = activityMeasurement.get("heartRate");
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

        updatePalette: function () {
            var color1 = $('#paletteColor1').val();
            var color2 = $('#paletteColor2').val();
            var color3 = $('#paletteColor3').val();
            this.hotlineLayer.setStyle({
                'palette': {
                    0.0: color1,
                    0.5: color2,
                    1.0: color3
                }
            }).redraw();
            $('#palette1').html(color1);
            $('#palette2').html(color2);
            $('#palette3').html(color3);
        },

        updateOutlineColor: function () {
            var color = $('#outlineColor').val();
            this.hotlineLayer.setStyle({'outlineColor': color}).redraw();
            $('#outlineHex').html(color);
        },

        updateStyle: function (event) {
            var style = {};
            style[event.target.id] = parseInt(event.target.value, 10);
            if (event.target.id == 'min' || event.target.id == 'max') {
                var elem = $('#' + event.target.id + 'Value');
                if (this.isPace) {
                    elem.html(this.fromMpsToPace(event.target.value / this.rangeMultiplier));
                } else {
                    elem.html(event.target.value);
                }
            }
            this.hotlineLayer.setStyle(style).redraw();
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

        updateMetric: function (event) {
            var $pace = $('.pace');
            var $heartRate = $('.heartRate');
            this.isPace = $heartRate.hasClass('YouAreHere');
            $pace.toggleClass('YouAreHere');
            $heartRate.toggleClass('YouAreHere');
            this.render();
        },

        createChart: function (activity, activityMeasurements) {
            var totalMeters = activity.get('properties').get('totalMeters');
            var metersToMiles = 0.000621371;
            var metersToFeet = 3.28084;
            var data = [];
            var i = 0;
            var firstMeasurement = activityMeasurements.at(i++);
            var elev = null;
            while (elev = null) {
                var elevationMeters = firstMeasurement.get("elevationMeters");
                if (elevationMeters) {
                    elev = Math.round(elevationMeters * metersToFeet);
                } else {
                    firstMeasurement = activityMeasurements.at(i++);
                }
            }
            var minElevation = elev;
            var maxElevation = elev;
            activityMeasurements.each(function (activityMeasurement) {
                var elevationMeters = activityMeasurement.get("elevationMeters");
                var miles = activityMeasurement.get("distanceMeters") * metersToMiles;
                if (elevationMeters && miles) {
                    elev = elevationMeters * metersToFeet;
                    if (elev > maxElevation) {
                        maxElevation = elev;
                    }
                    if (elev < minElevation) {
                        minElevation = elev;
                    }
                    data.push([miles, elev]);
                }
            });

            $('#chart').highcharts({
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    subtitle: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Elevation (ft)'
                        },
                        labels: {
                            formatter: function () {
                                return Math.round(this.value);
                            }
                        },
                        min: minElevation,
                        max: maxElevation
                    },
                    xAxis: {
                        title: {
                            text: 'Distance (mi)'
                        },
                        labels: {
                            formatter: function () {
                                return Math.round(this.value * 100)/100;
                            }
                        },
                        min: 0
                    },
                    tooltip: {
                        formatter: function () {
                            return Math.round(this.y) + ' ft.';
                        }
                    },
                    plotOptions: {
                        area: {
                            fillOpacity: 0.5
                        },
                        series: {
                            point: {
                                events: {
                                    mouseOver: function(event) {
                                        //console.log("Point mouseOver: " + event.target.x + ", " + event.target.y);
                                    },
                                    mouseOut: function(event) {
                                        //console.log("Point mouseOut: " + event.target.x + ", " + event.target.y);
                                    }
                                }
                            },
                            events: {
                                mouseOut: function() {
                                    //console.log("Series mouseOut: ");
                                }
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Elevation',
                            data: data
                        }]
                }
            );
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 10;
        }

    });

    return Demo10PageView;
});
