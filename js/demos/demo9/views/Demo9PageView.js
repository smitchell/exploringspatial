define([
    'jquery',
    'underscore',
    'backbone',
    'models/Activity',
    'collections/Activities',
    'leaflet_pip',
    'text!demos/demo9/templates/Demo9PageView.html'

], function ($, _, Backbone, Activity, Activities, leafletPip, templateHtml) {
    var Demo9PageView = Backbone.View.extend({

        events: {
            'click .page': 'onPageClick'
        },

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
        },

        /**
         * Fetch any needed data here.
         */
        fetchData: function() {
            this.activities = new Activities();
            this.activities.url = 'http://data.exploringspatial.com/activities/kc-mitchell';
            var self = this;
            this.activities.fetch({
                success: function () {
                    self.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            // Center map on Sport+Spine for this demo
            this.startLat = 38.9379;
            this.startLon = -94.6695;
            this.map = L.map('map_container', {
                center: [this.startLat, this.startLon],
                zoom: 17
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));
            this.activityGroup = L.featureGroup().addTo(this.map);

            // Add a circle to the map to represent the geoFence
            this.geoFence = L.featureGroup().addTo(this.map);
            var swLat = 38.93731;
            var swLon = -94.670954;
            var neLat = 38.938507;
            var neLon = -94.667805;
            L.polygon([L.latLng(swLat, swLon), L.latLng(swLat, neLon), L.latLng(neLat, neLon), L.latLng(neLat, swLon)], {
                weight: 3,
                color: '#838585',
                fillOpacity: 0.25
            }).addTo(this.geoFence);

            // Use Leaftet.pip to find only those layers that started from Sport+Spine so we can test geofencing.
            var pageDiv = this.$(".paging");
            var i = 1;
            var self = this;
            var layers, latLng, geometry, coordinates, triggerId;
            var className = 'page selected'; // make the first page selected.
            var firstMatch = true;
            this.activities.forEach(function (activity) {
                geometry = activity.get('geometry');
                coordinates = geometry.get('coordinates');
                latLng = L.latLng(coordinates[1], coordinates[0]);
                layers = leafletPip.pointInLayer(latLng, self.geoFence, true);
                // Did this activity match, and do we have less than 10 sample activities so far.
                if (layers.length > 0 && i <= 10) {
                    triggerId = activity.get('properties').get('activityId');
                    pageDiv.append($("<div class='" + className + "' id='" + triggerId + "' >" + i++ + "</div>"));
                    if (firstMatch) {
                        self.loadActivity(triggerId);
                        firstMatch = false;
                        className = 'page';
                    }
                }

            });
        },

        onPageClick: function (event) {
            $('.page').removeClass('selected');
            var elem = $(event.target);
            elem.addClass('selected');
            this.loadActivity(elem.attr('id'));
        },

        loadActivity: function (activityId) {
            this.activity = new Activity({activityId: activityId});
            var self = this;
            this.activity.fetch({
                success: function () {
                    self.onActivityFetched();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        onActivityFetched: function () {
            var self = this;
            this.activityGroup.getLayers().forEach(function (layer) {
                self.activityGroup.removeLayer(layer);
            });
            var latLng;
            var layers;
            var fencedStart = [];
            var fencedEnd = [];
            var middle = [];
            var coordinates = this.activity.get('geometry').get('coordinates');
            var insideFence = true;

            // Find the contiguous points from the start that are inside the geofence
            $.each(coordinates, function (index, coordinate) {
                latLng = L.latLng(coordinate[1], coordinate[0]);
                // Don't check anymore once we've left the geofence.
                if (insideFence) {
                    layers = leafletPip.pointInLayer(latLng, self.geoFence, true);
                    if (layers.length == 0) {
                        fencedStart.push(latLng);
                        insideFence = false;
                    }
                    if (insideFence) {
                        fencedStart.push(latLng);
                    } else {
                        middle.push(latLng);
                    }
                } else {
                    middle.push(latLng);
                }
            });
            if (fencedStart.length > 0) {
                L.polyline(fencedStart, {
                    color: '#838585',
                    weight: 3
                }).addTo(this.activityGroup);
            }

            // Find the contiguous points from the end that are inside the geofence
            insideFence = true;
            for (var i = middle.length - 1; i >= 0; i--) {
                latLng = middle[i];
                // Don't check anymore once we've left the geofence.
                if (insideFence) {
                    layers = leafletPip.pointInLayer(latLng, self.geoFence, true);
                    if (layers.length == 0) {
                        insideFence = false;
                    }
                    fencedEnd.push(latLng);
                }
            }

            // Find the points between the hidden points at the start and end of the polyline.
            if (middle.length > 0) {
                var polyline = [];
                $.each(middle, function (index, latLng) {
                    if (index <= middle.length - fencedEnd.length) {
                        polyline.push(latLng);
                    }
                });
                if (polyline.length > 0) {
                    L.polyline(polyline, {
                        color: '#ff0000',
                        weight: 3
                    }).addTo(this.activityGroup);
                }
            }
            if (fencedEnd.length > 0) {
                L.polyline(fencedEnd, {
                    color: '#838585',
                    weight: 3
                }).addTo(this.activityGroup);
            }

            // Let them see the whole polyline
            this.map.fitBounds(this.activityGroup.getBounds());

            // but then zoom into the privacy geofence
            setTimeout(function () {
                self.map.setView(L.latLng(self.startLat, self.startLon), 17, {animate: true});
            }, 1400);
        },

        sizeMaps: function () {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 12;
            var height = $demoBody.height() - 74;
            $('.detailMap').css({top: '5px', left: '5px', width: width + 'px', height: height + 'px'});
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 9;
        }

    });

    return Demo9PageView;
});
