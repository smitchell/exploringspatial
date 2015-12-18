define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'collections/ActivityMeasurements',
    'text!demos/demo10/templates/Demo10PageView.html',
    'leaflet_hotline'
], function ($, _, Backbone, Activity, ActivityMeasurements, templateHtml) {
    var Demo10PageView = Backbone.View.extend({

        events: {
            'input .paletteColor': 'updatePalette',
            'input #outlineColor': 'updateOutlineColor',
            'input .styleControl': 'updateStyle'
        },

        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
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
            var json = this.activity.toJSON();
            var model = json.properties;
            model.activityId = this.activity.get('activityId');
            var totalMeters = this.activity.get('properties').get('totalMeters');
            var totalSeconds = this.activity.get('properties').get('totalSeconds');
            model.distance = Math.round(totalMeters * 0.000621371 * 10) / 10;
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = (totalSeconds - (minutes * 60));
            model.time = minutes + ":" + seconds;
            var metersPerSecond = totalMeters / totalSeconds;
            var minutesPerMile = 26.8224 / metersPerSecond;
            minutes = Math.floor(minutesPerMile);
            seconds = Math.floor((minutesPerMile - minutes) * 60);
            model.pace = minutes + ":" + seconds;
            var date = new Date(this.activity.get('properties').get('startTime'));
            model.date = this.months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            model.outlineColor = '#000000';
            model.paletteColor1 = '#ff0000';
            model.paletteColor2 = '#ffff00';
            model.paletteColor3 = '#008800';
            model.minMetersPerSecond = 3.3528;  // 8:00 min/mi
            model.maxMetersPerSecond = 3.57632; // 7:30 min/mi
            model.outlineWidth = 1;
            model.weight = 5;
            model.smoothFactor = 1;
            this.$el.html(this.template(model));
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

            var lat, lng, speed;
            var data = [];
            this.activityMeasurements.each(function (activityMeasurement) {
                lat = activityMeasurement.get("lat");
                lng = activityMeasurement.get("lon");
                speed = activityMeasurement.get("metersPerSecond");
                if (lat && lng && speed) {
                    data.push([lat, lng, speed]);
                }
            });
            var options = {
                min: model.minMetersPerSecond,
                max: model.maxMetersPerSecond,
                palette: {
                    0.0: model.paletteColor1,
                    0.5: model.paletteColor2,
                    1.0: model.paletteColor3
                },
                weight: model.weight,
                outlineColor: model.outlineColor,
                outlineWidth: model.outlineWidth
            };
            this.hotlineLayer = L.hotline(data, options).addTo(this.map);
            this.map.fitBounds(this.hotlineLayer.getBounds(), {padding: [16, 16]});
        },

        updatePalette: function () {
            this.hotlineLayer.setStyle({
                'palette': {
                    0.0: $('#paletteColor1').val(),
                    0.5: $('#paletteColor2').val(),
                    1.0: $('#paletteColor3').val()
                }
            }).redraw();
        },

        updateOutlineColor: function () {
            this.hotlineLayer.setStyle({'outlineColor': $('#outlineColor').val()}).redraw();
        },

        updateStyle: function (event) {
            var style = {};
            style[event.target.id] = parseInt(event.target.value, 10);
            this.hotlineLayer.setStyle(style).redraw();
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var $sidepanel = $('#demo_sidepanel');
            var width = $demoBody.width() - $sidepanel.width() - 30;
            var height = $sidepanel.height() - 15;
            var left = $sidepanel.width() + 10;
            $('.detailMap').css({top: '5px', left: left + 'px', width: width + 'px', height: height + 'px'});
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
