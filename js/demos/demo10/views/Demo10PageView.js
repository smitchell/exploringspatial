define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'collections/ActivityMeasurements',
    'text!demos/demo10/templates/Demo10PageView.html'
], function ($, _, Backbone, Activity, ActivityMeasurements, templateHtml) {
    var Demo10PageView = Backbone.View.extend({


        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
        },

        /**
         * Fetch any needed data here.
         */
        fetchData: function() {
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

        checkCompleted: function() {
            if (this.loading < 1) {
                this.render();
            }
        },

        render: function () {
            this.$el.html(this.template());
            var properties = this.activity.get('properties');
            var minLat = properties.get('minLat');
            var minLon = properties.get('minLon');
            var maxLat = properties.get('maxLat');
            var maxLon = properties.get('maxLon');
            this.sizeMaps();
            this.startLat = (minLat + maxLat)/2;
            this.startLon = (minLon + maxLon)/2;
            this.map = L.map('map_container', {
                center: [this.startLat, this.startLon]
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));
            this.map.fitBounds([
                [minLat, minLon],
                [maxLat, maxLon]
            ]);

            var lat, lng, speed;
            var data = [];
            this.activityMeasurements.each(function(activityMeasurement){
                lat = activityMeasurement.get("lat");
                lng = activityMeasurement.get("lng");
                speed = activityMeasurement.get("metersPerSecond");
                data.push([lat, lng, speed]);
            });
            var options =  {
            			min: 150,
            			max: 350,
            			palette: {
            				0.0: '#008800',
            				0.5: '#ffff00',
            				1.0: '#ff0000'
            			},
            			weight: 5,
            			outlineColor: '#000000',
            			outlineWidth: 1
            		};
            //var hotlineLayer = L.hotline(data, options).addTo(this.map);
            //var bounds = hotlineLayer.getBounds();
          	//map.fitBounds(bounds, { padding: [16, 16] });
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 28;
            var height = $demoBody.height() - 20;
            $('.detailMap').css({top: '5px', left: '5px', width: width + 'px', height: height + 'px'});
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
