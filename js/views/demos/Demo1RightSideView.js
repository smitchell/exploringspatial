define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/Demo1RightSideView.html',
    'leaflet_google',
    'leaflet_bing'
], function ($, _, Backbone, templateHtml) {
    var Demo1RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            var osmLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            var mapQuest = new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',{
                attribution:
                    'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
            'Map data {attribution.OpenStreetMap}',
                subdomains: '1234'
            });
            var googleLayer = new L.Google('ROADMAP');
            var bingLayer = new L.BingLayer("AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY");
            var map = L.map('map_container', {
                center: [51.505, -0.09],
                zoom: 13,
                layers: [googleLayer]
            });
            var baseLayers = {
                'Google': googleLayer,
                'Bing' : bingLayer,
                'OSM': osmLayer,
                'MapQuest': mapQuest
            };
            L.control.layers(baseLayers).addTo(map);
            L.marker([51.5, -0.09]).addTo(map)
                .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
            L.circle([51.508, -0.11], 500, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5
            }).addTo(map).bindPopup("I am a circle.");
            L.polygon([
                [51.509, -0.08],
                [51.503, -0.06],
                [51.51, -0.047]
            ]).addTo(map).bindPopup("I am a polygon.");
            this.popup = L.popup();
            map.on('click', this.onMapClick);
            this.map = map;
        },
        onMapClick: function(e) {
            this.popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(this.map);
        }
    });
    return Demo1RightSideView;
});
