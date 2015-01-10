/**
 * The purpose of the MapZoomControlsView is render an activity polyline on a map.
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
            this.collection = args.collection;
            this.render();
        },

        render: function() {
            var geojson = L.geoJson(this.collection.toJSON()).addTo(this.map);
            //this.map.fitBounds(geojson.getBounds());
            this.map.fitBounds([
                [38.898314, -94.742403],
                [38.941923, -94.667372]
            ]);
        }

    });

    return ActivityMapLayerView;
});
