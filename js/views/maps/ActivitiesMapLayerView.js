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
            var popupOptions = {maxWidth: 200};
            var geojson = L.geoJson(this.collection.toJSON(),{
                style: function(feature) {
                    return {
                        // Doesn't seem to work.
                        icon: this.startIcon
                    }
                },
                onEachFeature: function(feature, layer) {
                    var date = new Date(feature.properties.startTime);
                    var msg = [];
                    msg.push("<b>" + feature.properties.name + "</b><br/>");
                    msg.push("Start: " + date.toLocaleDateString() + " " + date.toLocaleTimeString() + "<br/>");
                    msg.push("Dist: " + Math.round((feature.properties.totalMeters * 0.000621371)*100)/100 + " mi<br/>");

                    layer.bindPopup(msg.join(''), popupOptions);
                }
            }).addTo(this.map);
            //this.map.fitBounds(geojson.getBounds());
            this.map.fitBounds([
                [38.898314, -94.742403],
                [38.941923, -94.667372]
            ]);
        }

    });

    return ActivityMapLayerView;
});
