define(function(require) {
    "use strict";
    var $            = require('jquery'),
        _            = require('underscore'),
        Backbone     = require('backbone'),
        L            = require('leaflet'),
        templateHtml = require('text!demos/demo1/templates/Demo1PageView.html');
        require('leaflet_google');
        //require('leaflet_bing');

    var Demo1PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            var self = this;
            $(window).resize (function() {
                if (self.map && self.overlays) {
                    self.map.fitBounds(self.overlays);
                }
            });
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.sizeMaps();
            var osmLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
            var mapquestLink = '<a href="http://www.mapquest.com//">MapQuest</a>';
            var mapquestPic = '<img src="http://developer.mapquest.com/content/osm/mq_logo.png">';
            var mapQuest = L.tileLayer(
                'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                  attribution: '&copy; ' + mapLink + '. Tiles courtesy of ' + mapquestLink + mapquestPic,
                  maxZoom: 18,
                  subdomains: '1234'
                });
            //var mapQuest = new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',{
            //    attribution:
            //        'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
            //'Map data {attribution.OpenStreetMap}',
            //    subdomains: '1234'
            //});
            var googleLayer = new L.Google('ROADMAP');
            //var bingLayer = new L.BingLayer("AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY");
            var map = L.map('map_container', {
                center: [51.505, -0.09],
                zoom: 13,
                layers: [googleLayer]
            });
            var baseLayers = {
                'Google': googleLayer,
                //'Bing' : bingLayer,
                'OSM': osmLayer,
                'MapQuest': mapQuest
            };
            L.control.layers(baseLayers).addTo(map);
            this.overlays = L.featureGroup().addTo(map);
            L.marker([51.5, -0.09]).addTo(this.overlays)
                .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
            L.circle([51.508, -0.11], 500, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5
            }).addTo(this.overlays).bindPopup("I am a circle.");
            L.polygon([
                [51.509, -0.08],
                [51.503, -0.06],
                [51.51, -0.047]
            ]).addTo(this.overlays).bindPopup("I am a polygon.");
            this.popup = L.popup();
            map.on('click', this.onMapClick, this);
            map.fitBounds(this.overlays.getBounds());
            this.map = map;
        },

        onMapClick: function(e) {
            this.popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(this.map);
        },

        sizeMaps: function() {
            var $demoBody = $('#demoBody');
            var width = $demoBody.width() - 12;
            var height = $demoBody.height() - 24;
            $('.detailMap').css({top: '5px',left: '5px', width: width + 'px', height: height + 'px'});
        },

        destroy: function() {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function() {
            return 1;
        }
    });

    return Demo1PageView;
});
