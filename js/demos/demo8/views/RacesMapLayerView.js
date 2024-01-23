/**
 * The purpose of the RacesMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'underscore',
    'backbone',
    'leaflet',
    'models/Activity'
], function (_, Backbone, L, Activity) {

    var RacesMapLayerView = Backbone.View.extend({

        initialize: function (args) {
            this.maps = args.maps;
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

            this.render();
            this.dispatcher.on(this.dispatcher.Events.RACE_SELECTED, this.onRaceSelected, this);
        },

        render: function () {
            var mainland = this.maps['mainland'];
            var _self = this;
            if (this.activitiesLayer != null && mainland.hasLayer(this.activitiesLayer)) {
                this.activitiesLayer.getLayers().forEach(function (layer) {
                    _self.activitiesLayer.removeLayer(_self.activitiesLayer.getBounds());
                    _self.activitiesLayer.removeLayer(_self.activitiesLayer.getBounds());
                    _self.activitiesLayer.removeLayer(_self.activitiesLayer.getBounds());
                });
                mainland.removeLayer(this.activitiesLayer);
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
                            iconUrl: 'http://exploringspatial.byteworksinc.com/media/Red-dot-5px.png'
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
                    _self.dispatcher.trigger(_self.dispatcher.Events.RACE_ADDED, {latLng: latLng});
                }
            });

            if (this.activitiesLayer.getLayers().length > 0) {
                mainland.addLayer(this.activitiesLayer);
                mainland.on('popupopen', function (event) {
                    _self.onPopupOpen(event);
                });
                $('.returnToSearch').on('click', '#returnTrigger', function (event) {
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
            var mainland = this.maps['mainland'];
            mainland.closePopup(popup);
            this.originalCenter = mainland.getCenter();
            this.originalZoom = mainland.getZoom();
            this.activity = new Activity({activityId: event.target.id});
            var self = this;
            this.activity.fetch({
                success: function () {
                    self.renderActivity();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        renderActivity: function () {
            var mainland = this.maps['mainland'];
            $('#searchBox').slideUp();
            $('.returnToSearch').show();
            if (mainland.hasLayer(this.activitiesLayer)) {
                mainland.removeLayer(this.activitiesLayer);
            }
            var props = this.activity.get('properties');
            // TODO - Find out how this can be undefined.
            if (props) {
                $('#demoBanner').find('h1:first').html(props.get('name'));
                mainland.fitBounds([
                    [props.get('minLat'), props.get('minLon')],
                    [props.get('maxLat'), props.get('maxLon')]
                ]);
            }
            var style = {
                color: '#FF0000',
                weight: 3,
                opacity: 0.6
            };

            this.activityLayer = L.geoJson(this.activity.toJSON(), {style: style}).addTo(mainland);
            var polyline = this.activity.get('geometry').get('coordinates');
            var startPoint = polyline[0];
            var endPoint = polyline[polyline.length - 1];
            this.activityStart = L.marker([startPoint[1], startPoint[0]], {icon: this.startIcon}).addTo(mainland);
            this.activityEnd = L.marker([endPoint[1], endPoint[0]], {icon: this.endIcon}).addTo(mainland);
            this.dispatcher.trigger(this.dispatcher.Events.RACE_ZOOMED, {
                type: this.dispatcher.Events.RACE_ZOOMED
            });
        },

        onReturnToSearch: function (event) {
            var mainland = this.maps['mainland'];
            $('.returnToSearch').hide();
            $('#searchBox').slideDown();
            if (this.activitiesLayer != null) {
                if (this.activityLayer != null && mainland.hasLayer(this.activityLayer)) {
                    mainland.removeLayer(this.activityLayer);
                    this.activityLayer = null;
                }
                if (this.activityStart != null && mainland.hasLayer(this.activityStart)) {
                    mainland.removeLayer(this.activityStart);
                    this.activityStart = null;
                }
                if (this.activityEnd != null && mainland.hasLayer(this.activityEnd)) {
                    mainland.removeLayer(this.activityEnd);
                    this.activityEnd = null
                }
                mainland.addLayer(this.activitiesLayer);
                if (this.originalCenter != null && this.originalZoom != null) {
                    mainland.setView(this.originalCenter, this.originalZoom, {animate: true});
                    this.originalCenter = null;
                    this.originalZoom = null;
                }
                $('#demoBanner').find('h1:first').html('On-the-fly "50-state Marathon Club" Style Map');
            }
            this.render();
            event.stopPropagation();
            return false;
        },

        onRaceSelected: function (event) {
            this.meters = event.meters;
            this.render();
        }

    });

    return RacesMapLayerView;
});
