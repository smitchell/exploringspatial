/**
 * The purpose of the MapZoomControlsView is render an activity polyline on a map.
 */
define([
    'underscore',
    'backbone',
    'models/Activity',
    'leaflet_markercluster'
], function(_, Backbone, Activity) {

    var ActivityMapLayerView = Backbone.View.extend({

        initialize: function(args) {
            this.map = args.map;
            this.originalBounds = null;
            this.activityLayer = null;
            this.activityStart = null;
            this.activityEnd = null;
            this.collection = args.collection;
            var CustomIcon = L.Icon.extend({options: {
                iconSize: [33, 50],
                iconAnchor: [16, 49]
            }});
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});
            this.render();
        },

        render: function() {
            var _self = this;
            geoJsonLayer = L.geoJson(this.collection.toJSON(),{
                onEachFeature: _self.onEachFeature
            });
            //this.map.fitBounds(geojson.getBounds());
            this.map.fitBounds([
                [34.452218, -97.998047],
                [42.098222, -77.036133]
            ]);
            this.activitiesLayer = L.markerClusterGroup();
            this.activitiesLayer.addLayer(geoJsonLayer);
            this.map.addLayer(this.activitiesLayer);
            this.map.on('popupopen', function(event) {_self.onPopupOpen(event);});
            $('.returnToSearch').on('click', '.returnTrigger', function(event){_self.onReturnToSearch(event)});
        },

        onEachFeature: function(feature, layer) {
            var date = new Date(feature.properties.startTime);
            var triggerId = feature.properties.activityId;
            var msg = [];
            msg.push('<b>' + feature.properties.name + '</b><br/>');
            msg.push('Start: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '<br/>');
            msg.push('Dist: ' + Math.round((feature.properties.totalMeters * 0.000621371)*100)/100 + ' mi<br/>');
            msg.push('<a id="' + triggerId + '" class="popupTrigger" href="javascript:void(0)" />Go to Activity</a>');
            layer.bindPopup(msg.join(''), {maxWidth: 200});
        },

        onPopupOpen: function(event) {
            var popup = event.popup;
            var _self = this;
            $(popup._container).on('click','.popupTrigger', function(event) {_self.onOpenActivity(event, popup);});

        },

        onOpenActivity: function(event, popup) {
            var location = popup._latlng;
            this.map.closePopup(popup);
            this.originalBounds = this.map.getBounds();
            this.activity = new Activity({activityId: event.target.id});
            var _this = this;
            this.activity.fetch({
                success: function () {
                    _this.renderActivity();
                }
            });
        },

        renderActivity: function() {
            $('.returnToSearch').show();
            if (this.map.hasLayer(this.activitiesLayer)) {
                this.map.removeLayer(this.activitiesLayer);
            }
            var props = this.activity.get('properties');
            this.map.fitBounds([
                [props.get('minLat'), props.get('minLon')],
                [props.get('maxLat'), props.get('maxLon')]
            ]);
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
        },

        onReturnToSearch: function(event) {
            $('.returnToSearch').hide();
            if (this.originalBounds != null) {
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
                this.map.fitBounds(this.originalBounds);
                this.map.addLayer(this.activitiesLayer);
            }
            this.originalBounds = null;
        }

    });

    return ActivityMapLayerView;
});
