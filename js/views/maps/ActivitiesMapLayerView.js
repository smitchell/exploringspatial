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
            this.collection = args.collection;
            this.render();
        },

        render: function() {
            var popupOptions = {maxWidth: 200};
            var _self = this;
            var geojson = L.geoJson(this.collection.toJSON(),{
                onEachFeature: _self.onEachFeature
            }).addTo(this.map);
            //this.map.fitBounds(geojson.getBounds());
            this.map.fitBounds([
                [38.898314, -94.742403],
                [38.941923, -94.667372]
            ]);
        },

        onEachFeature: function(feature, layer) {
            var date = new Date(feature.properties.startTime);
            var msg = [];
            msg.push('<b>' + feature.properties.name + '</b><br/>');
            msg.push('Start: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '<br/>');
            msg.push('Dist: ' + Math.round((feature.properties.totalMeters * 0.000621371)*100)/100 + ' mi<br/>');
            msg.push('<a class="trigger" href="#activity/' + feature.properties.activityId + '" />Go to Activity</a>');
            layer.bindPopup(msg.join(''), {maxWidth: 200});
            var _self = this;
            $('#map_container').on('click', '.trigger', function() {'hello'});
        },

        onClick: function(event) {
            alert(event.toJSON());
        }

    });

    return ActivityMapLayerView;
});
