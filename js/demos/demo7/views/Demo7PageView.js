define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'demos/demo7/collections/Counties',
    'demos/demo7/views/CountiesListView',
    'demos/demo7/views/CountiesMapLayerView',
    'views/maps/MapView',
    'text!demos/demo7/templates/Demo7PageView.html',
    'leaflet_google'
    //'leaflet_bing'
], function ($, _, Backbone, MapEventDispatcher, Counties, CountiesListView, CountiesMapLayerView, MapView, templateHtml) {
    var Demo7PageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.fetchData();
        },

        fetchData: function() {
            this.collection = new Counties();
            var _this = this;
            this.collection.fetch({
                success: function () {
                    _this.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            this.collection.sort();
            this.$el.html(this.template());
            this.sizeMaps();

            var baseLayers = {
                'Google': new L.Google('ROADMAP'),
                //'Bing': new L.BingLayer("AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY"),
                'OSM': new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }),
                'MapQuest': new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                    'Map data {attribution.OpenStreetMap}',
                    subdomains: '1234'
                }),
                'Satellite': new L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                    'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
                    subdomains: '1234'
                })
            };

            this.map = L.map('map_container', {
                center: [38.43638, -98.195801],
                zoom: 6,
                layers: [baseLayers['Google']],
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false,
                keyboard: false
            });

            L.control.layers(baseLayers).addTo(this.map);
            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;

            new CountiesMapLayerView({
                collection: this.collection,
                map: this.map,
                dispatcher: this.dispatcher
            });

            new CountiesListView({
                collection: this.collection,
                el: $('#county_list'),
                dispatcher: this.dispatcher
            });
        },

        sizeMaps: function () {
            var $countyList = $('#county_list');
            var countyListWidth = $countyList.width();
            var $mapBox = $('#demo_container');
            var width = $mapBox.width() - countyListWidth - 40;
            var height = $mapBox.height() - 20;

            $countyList.css({height: (height - 40) + 'px'});
            var $logo = $('#logo');
            var logoHeight = $logo.height();
            var logoLeft = ($(window).width() / 2) - (logoHeight / 2);
            $logo.css({left: logoLeft + 'px'});
            $('.detailMap').css({
                top: '10px',
                left: +(countyListWidth + 10) + 'px',
                width: width + 'px',
                height: (height - logoHeight - 10) + 'px'
            });
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 7;
        }

    });

    return Demo7PageView;
});
