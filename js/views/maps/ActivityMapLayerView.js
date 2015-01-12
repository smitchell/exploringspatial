/**
 * The purpose of the ActivityMapLayerView is render an activity polyline on a map.
 */
define([
    'underscore',
    'backbone',
    'text!templates/maps/MapZoomControlsView.html',
    'leaflet'
], function(_, Backbone, templateHtml) {

    var ActivityMapLayerView = Backbone.View.extend({

        initialize: function(args) {
            this.map = args.map;
            var CustomIcon = L.Icon.extend({options: {
                iconSize: [33, 50],
                iconAnchor: [16, 49]
            }});
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});
            this.render();
        },

        render: function() {
            var props = this.model.get('properties');
            this.map.fitBounds([
                [props.get('minLat'), props.get('minLon')],
                [props.get('maxLat'), props.get('maxLon')]
            ]);
            var style = {
                color: '#FF0000',
                weight: 3,
                opacity: 0.6
            };
            L.geoJson(this.model.toJSON(), {style: style}).addTo(this.map);
            var polyline = this.model.get('geometry').get('coordinates');
            var startPoint = polyline[0];
            var endPoint = polyline[polyline.length - 1];
            L.marker([startPoint[1], startPoint[0]], {icon: this.startIcon}).addTo(this.map);
            L.marker([endPoint[1], endPoint[0]], {icon: this.endIcon}).addTo(this.map);
        }

    });

    return ActivityMapLayerView;
});
