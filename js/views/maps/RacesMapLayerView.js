/**
 * The purpose of the RacesMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'underscore',
    'backbone',
    'models/Activity',
    'leaflet_markercluster'
], function (_, Backbone, Activity) {

    var RacesMapLayerView = Backbone.View.extend({

        initialize: function (args) {
            this.mainlandMap = args.mainlandMap;
            this.alaskaMap = args.alaskaMap;
            this.hawaiiMap = args.hawaiiMap;
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
            this.meters = args.meters;
            this.dispatcher = args.dispatcher;
            this.dispatcher.on(this.dispatcher.Events.ON_RACE_SELECTED, this.onRaceSelected, this);
            this.render();
        },

        render: function () {
            var _self = this;
            if (this.activitiesLayer != null && this.mainlandMap.hasLayer(this.activitiesLayer)) {
                this.activitiesLayer.getLayers().forEach(function (layer) {
                    _self.activitiesLayer.removeLayer(layer);
                });
                this.mainlandMap.removeLayer(this.activitiesLayer);
            }
            var startRange = this.meters * 0.96;
            var endRange = this.meters * 1.05;
            this.activitiesLayer = L.geoJson(this.collection.toJSON(), {
                filter: function (feature, layers) {
                    return feature.properties.eventType && feature.properties.eventType == "Race" && feature.properties.totalMeters > startRange && feature.properties.totalMeters < endRange;
                },
                pointToLayer: function (feature, latlng) {
                    var smallIcon = L.Icon.extend({
                        options: {
                            iconSize: [5, 5],
                            iconAnchor: [2, 2],
                            iconUrl: 'http://www.exploringspatial.com/media/Red-dot-5px.png'
                        }
                    });
                    return L.marker(latlng, {icon: new smallIcon()});
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
                    var point = feature.geometry.coordinates;
                    var latLng = L.latLng(point[1], point[0]);
                    _self.dispatcher.trigger(_self.dispatcher.Events.ON_RACE_ADDED, {latLng: latLng});
                }
            });

            if (this.activitiesLayer.getLayers().length > 0) {
                this.mainlandMap.addLayer(this.activitiesLayer);
                this.mainlandMap.on('popupopen', function (event) {
                    _self.onPopupOpen(event);
                });
                $('.returnToSearch').on('click', '.returnTrigger', function (event) {
                    _self.onReturnToSearch(event)
                });
            }
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
            this.mainlandMap.closePopup(popup);
            this.originalCenter = this.mainlandMap.getCenter();
            this.originalZoom = this.mainlandMap.getZoom();
            this.activity = new Activity({activityId: event.target.id});
            var _this = this;
            this.activity.fetch({
                success: function () {
                    _this.renderActivity();
                }
            });
        },

        renderActivity: function () {
            $('#searchBox').slideUp();
            $('.returnToSearch').show();
            if (this.mainlandMap.hasLayer(this.activitiesLayer)) {
                this.mainlandMap.removeLayer(this.activitiesLayer);
            }
            var props = this.activity.get('properties');
            $('#container2').find('h1:first').html(props.get('name'));
            this.mainlandMap.fitBounds([
                [props.get('minLat'), props.get('minLon')],
                [props.get('maxLat'), props.get('maxLon')]
            ]);
            var style = {
                color: '#FF0000',
                weight: 3,
                opacity: 0.6
            };

            this.activityLayer = L.geoJson(this.activity.toJSON(), {style: style}).addTo(this.mainlandMap);
            var polyline = this.activity.get('geometry').get('coordinates');
            var startPoint = polyline[0];
            var endPoint = polyline[polyline.length - 1];
            this.activityStart = L.marker([startPoint[1], startPoint[0]], {icon: this.startIcon}).addTo(this.mainlandMap);
            this.activityEnd = L.marker([endPoint[1], endPoint[0]], {icon: this.endIcon}).addTo(this.mainlandMap);
            this.dispatcher.trigger(this.dispatcher.Events.ON_RACE_ZOOMED);
        },

        onReturnToSearch: function (event) {
            $('.returnToSearch').hide();
            $('#searchBox').slideDown();
            if (this.activitiesLayer != null) {
                if (this.activityLayer != null && this.mainlandMap.hasLayer(this.activityLayer)) {
                    this.mainlandMap.removeLayer(this.activityLayer);
                    this.activityLayer = null;
                }
                if (this.activityStart != null && this.mainlandMap.hasLayer(this.activityStart)) {
                    this.mainlandMap.removeLayer(this.activityStart);
                    this.activityStart = null;
                }
                if (this.activityEnd != null && this.mainlandMap.hasLayer(this.activityEnd)) {
                    this.mainlandMap.removeLayer(this.activityEnd);
                    this.activityEnd = null
                }
                this.mainlandMap.addLayer(this.activitiesLayer);
                if (this.originalCenter != null && this.originalZoom != null) {
                    this.mainlandMap.setView(this.originalCenter, this.originalZoom, {animate: true});
                    this.originalCenter = null;
                    this.originalZoom = null;
                }
                $('#container2').find('h1:first').html('On-the-fly "50-state Marathon Club" Style Map');
            }
            this.render();
        },

        onRaceSelected: function (event) {
            this.meters = event.meters;
            this.render();
        }

    });

    return RacesMapLayerView;
});
