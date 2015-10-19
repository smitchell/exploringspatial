define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'collections/Counties',
    'views/CountiesListView',
    'views/maps/CountiesMapLayerView',
    'views/maps/MapView',
    'text!templates/demos/Demo7RightSideView.html',
    'leaflet_google',
    'leaflet_bing'
], function ($, _, Backbone, MapEventDispatcher, Counties, CountiesListView, CountiesMapLayerView, MapView, templateHtml) {
    var Demo7RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.collection = new Counties();
            var _this = this;
            this.collection.fetch({
                success: function () {
                    _this.render();
                }
            });
        },
        render: function () {
            this.collection.sort();
            var countyWidth = 200;
            var mapWidth =  this.args.mapWidth - countyWidth;
            this.$el.html(this.template({countyWidth: countyWidth, mapWidth: mapWidth, mapHeight: this.args.mapHeight}));
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
            var aerial = new L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg',{
                attribution:
                'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
                subdomains: '1234'
            });
            var googleLayer = new L.Google('ROADMAP');
            var bingLayer = new L.BingLayer("AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY");
            var map = L.map('map_container', {
                            center: [38.43638, -98.195801],
                            zoom: 6,
                            layers: [googleLayer],
                            scrollWheelZoom: false,
                            touchZoom: false,
                            doubleClickZoom: false,
                            zoomControl: false,
                            dragging: false
                        });
            var baseLayers = {
                'Google': googleLayer,
                'Bing' : bingLayer,
                'OSM': osmLayer,
                'MapQuest': mapQuest,
                'Satellite': aerial
            };
            L.control.layers(baseLayers).addTo(map);
            this.map = map;
            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;
            new CountiesMapLayerView({collection: this.collection, map: this.map, dispatcher: this.dispatcher});
            new CountiesListView({collection: this.collection, el: $('#county_list'), dispatcher: this.dispatcher});
        }
    });
    return Demo7RightSideView;
});
