/**
 * The purpose of the ActivityMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'underscore',
    'backbone',
    'models/Activity',
    'leaflet_prunecluster'
], function (_, Backbone, Activity) {

    var ActivityMapLayerView = Backbone.View.extend({
        mapOffset: 60,

        initialize: function (args) {
            this.map = args.map;
            this.activitiesLayer = null;
            this.originalCenter = null;
            this.originalZoom = null;
            this.activityLayer = null;
            this.activityStart = null;
            this.activityEnd = null;
            this.collection = args.collection;
            var CustomIcon = L.Icon.extend({
                options: {
                    iconSize: [33, 50],
                    iconAnchor: [16, 49]
                }
            });
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});

            this.activitySearch = args.activitySearch;
            this.activitySearch.on('change', this.render, this);
            this.render();
            var _this = this;
            $(window).resize (function () {
                if (_this.map && _this.activityLayer) {
                    _this.map.fitBounds(_this.activityLayer);
                }
            })
        },

        render: function () {
            if (this.activitiesLayer != null && this.map.hasLayer(this.activitiesLayer)) {
                this.map.removeLayer(this.activitiesLayer);
            }
            var returnToSearch = $('.returnToSearch a');
            returnToSearch.unbind('click');
            var _self = this;
            var filteredActivities = [];
            this.collection.each(function(activity) {
                if (_self.activitySearch.filterActivityJson(activity)) {
                    filteredActivities.push(activity);
                }
            });
            // Do not create a markerClusterGroup if the geoJsonLayer map layer is empty.
            if (filteredActivities.length > 0) {
                this.activitiesLayer = new PruneClusterForLeaflet();
                this.activitiesLayer.PrepareLeafletMarker = function (marker, data, category) {
                    var date = new Date(data.startTime);
                    var triggerId = data.activityId;
                    var msg = [];
                    msg.push('<b>' + data.name + '</b><br/>');
                    msg.push('Start: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '<br/>');
                    msg.push('Dist: ' + Math.round((data.totalMeters * 0.000621371) * 100) / 100 + ' mi<br/>');
                    msg.push('<a id="' + triggerId + '" class="popupTrigger" href="javascript:void(0)" />Go to Activity</a>');
                    if (marker.getPopup()) {
                        marker.setPopupContent(msg.join(''), data.popupOptions);
                    }
                    else {
                        marker.bindPopup(msg.join(''), data.popupOptions);
                    }
                };
                this.map.addLayer(this.activitiesLayer);
                var marker, minLat, minLon, maxLat, maxLon, lat, lng, coordinates;
                $.each(filteredActivities, function(i, filteredActivity){
                    coordinates = filteredActivity.get('geometry').get('coordinates');
                    lat = coordinates[1];
                    lng = coordinates[0];
                    marker = new PruneCluster.Marker(lat, lng);
                    marker.data = filteredActivity.get('properties').toJSON();
                    _self.activitiesLayer.RegisterMarker(marker);
                    if (typeof minLat == 'undefined' || lat < minLat) {
                        minLat = lat;
                    }
                    if (typeof minLon == 'undefined' || lng < minLon) {
                        minLon = lng;
                    }
                    if (typeof maxLat == 'undefined' || lat > maxLat) {
                        maxLat = lat;
                    }
                    if (typeof maxLon == 'undefined' || lng > maxLon) {
                        maxLon = lng;
                    }
                });

                this.map.on('popupopen', function (event) {
                    _self.onPopupOpen(event);
                });
                returnToSearch.click(function (event) {
                    _self.onReturnToSearch(event)
                });
                if (!isNaN(minLat) && !isNaN(minLon) && !isNaN(maxLat) && !isNaN(maxLon)) {
                    this.map.fitBounds(new L.LatLngBounds(
                        new L.LatLng(minLat, minLon),
                        new L.LatLng(maxLat, maxLon)));
                }
                this.activitiesLayer.ProcessView();
            }
        },

        onEachFeature: function (feature, layer) {
            var date = new Date(feature.properties.startTime);
            var triggerId = feature.properties.activityId;
            var msg = [];
            msg.push('<b>' + feature.properties.name + '</b><br/>');
            msg.push('Start: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '<br/>');
            msg.push('Dist: ' + Math.round((feature.properties.totalMeters * 0.000621371) * 100) / 100 + ' mi<br/>');
            msg.push('<a id="' + triggerId + '" class="popupTrigger" href="javascript:void(0)" />Go to Activity</a>');
            layer.bindPopup(msg.join(''), {maxWidth: 200});
        },

        onPopupOpen: function (event) {
            var popup = event.popup;
            var _self = this;
            $(popup._container).on('click', '.popupTrigger', function (event) {
                _self.onOpenActivity(event, popup);
            });

        },

        onOpenActivity: function (event, popup) {
            var location = popup._latlng;
            this.map.closePopup(popup);
            this.originalCenter = this.map.getCenter();
            this.originalZoom = this.map.getZoom();
            this.activity = new Activity({activityId: event.target.id});
            var _this = this;
            this.activity.fetch({
                success: function () {
                    _this.renderActivity();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        renderActivity: function () {
            $('#searchBox').slideUp();
            $('.returnToSearch').show();
            if (this.map.hasLayer(this.activitiesLayer)) {
                this.map.removeLayer(this.activitiesLayer);
            }
            $('#demoTitle').html(this.activity.get('properties').get('name'));
            var style = {
                color: '#FF0000',
                weight: 3,
                opacity: 0.6
            };

            this.activityLayer = L.geoJson(this.activity.toJSON(), {style: style}).addTo(this.map);
            var polyline = this.activity.get('geometry').get('coordinates');
            var startPoint = polyline[0];
            var endPoint = polyline[polyline.length - 1];
            this.activityStart = L.marker([startPoint[1], startPoint[0]], {icon: this.startIcon}).addTo(this.map);
            this.activityEnd = L.marker([endPoint[1], endPoint[0]], {icon: this.endIcon}).addTo(this.map);
            var mapBoxDiv = $('.detailsMapBox');
            var top = mapBoxDiv[0].offsetTop;
            var height = mapBoxDiv.height();
            mapBoxDiv.css({top: (top - this.mapOffset) + 'px', height: (height + this.mapOffset) + 'px'});

            var mapDiv = $('.detailMap');
            var mapHeight = mapDiv.height() + this.mapOffset;
            mapDiv.css({height: mapHeight + 'px'});
            this.map.fitBounds(this.activityLayer.getBounds());
        },

        onReturnToSearch: function (event) {
            $('.returnToSearch').hide();
            $('#searchBox').slideDown();
            if (this.activitiesLayer != null) {
                if (this.activityLayer != null && this.map.hasLayer(this.activityLayer)) {
                    this.map.removeLayer(this.activityLayer);
                    this.activityLayer = null;
                }
                if (this.activityStart != null && this.map.hasLayer(this.activityStart)) {
                    this.map.removeLayer(this.activityStart);
                    this.activityStart = null;
                }
                if (this.activityEnd != null && this.map.hasLayer(this.activityEnd)) {
                    this.map.removeLayer(this.activityEnd);
                    this.activityEnd = null
                }
                this.map.addLayer(this.activitiesLayer);
                if (this.originalCenter != null && this.originalZoom != null) {
                    this.map.setView(this.originalCenter, this.originalZoom, {animate: true});
                    this.originalCenter = null;
                    this.originalZoom = null;
                }
                $('#demoTitle').html('Electronic Running Log in GeoJSON Format');
            }
            var mapBoxDiv = $('.detailsMapBox');
            var top = mapBoxDiv[0].offsetTop;
            var height = mapBoxDiv.height();
            mapBoxDiv.css({top: (top + this.mapOffset) + 'px', height: (height - this.mapOffset) + 'px'});

            var mapDiv = $('.detailMap');
            var mapHeight = mapDiv.height();
            mapDiv.css({top: '5px', height: (mapHeight - this.mapOffset) + 'px'});
        },

        destroy: function () {
            $('.returnToSearch a').unbind('click');
            // Remove view from DOM
            this.remove();
        }

    });

    return ActivityMapLayerView;
});
