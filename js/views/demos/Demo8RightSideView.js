define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'collections/States',
    'collections/Activities',
    'views/maps/StatesMapLayerView',
    'views/maps/RacesMapLayerView',
    'text!templates/demos/Demo8RightSideView.html',
    'leaflet_google',
    'leaflet_bing'
], function ($, _, Backbone, MapEventDispatcher, States, Activities, StatesMapLayerView, RacesMapLayerView, templateHtml) {
    var Demo8RightSideView = Backbone.View.extend({
        MARATHON: 'marathon',
        HALF_MARATHON: 'halfMarathon',
        FIVE_K: 'fiveK',

        events: {
            'change input:radio[name=race]': 'onRaceSelected'
        },

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.states = new States();
            var _this = this;
            this.states.fetch({
                success: function () {
                    _this.fetchActivities();
                }
            });
            this.raceType = this.MARATHON;
        },

        fetchActivities: function () {
            this.activities = new Activities();
            this.activities.url = 'http://data.exploringspatial.com/activities/kc-mitchell';
            var _this = this;
            this.activities.fetch({
                success: function () {
                    _this.render();
                }
            });
        },

        render: function () {
            this.$el.html(this.template({
                isMarathon: this.isSelected(this.MARATHON),
                isHalf: this.isSelected(this.HALF_MARATHON),
                isFiveK:this.isSelected(this.FIVE_K),
                mapWidth: this.args.mapWidth,
                mapHeight: this.args.mapHeight
            }));
            var osmLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            var mapQuest = new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
                attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                'Map data {attribution.OpenStreetMap}',
                subdomains: '1234'
            });
            var googleLayer = new L.Google('ROADMAP');
            var bingLayer = new L.BingLayer("AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY");
            var map = L.map('map_container', {
                center: [38.43638, -98.195801],
                zoom: 3,
                layers: [bingLayer],
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false
            });
            var baseLayers = {
                'Google': googleLayer,
                'Bing': bingLayer,
                'OSM': osmLayer,
                'MapQuest': mapQuest
            };
            L.control.layers(baseLayers).addTo(map);
            this.map = map;
            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;
            new StatesMapLayerView({
                collection: this.states,
                map: this.map,
                dispatcher: this.dispatcher
            });
            new RacesMapLayerView({
                collection: this.activities,
                map: this.map,
                dispatcher: this.dispatcher,
                meters: this.getRaceDistance(this.raceType)
            });
        },

        isSelected: function(race) {
            var selected = "";
            if (this.raceType == race) {
                selected = "checked"
            }
            return selected;
        },

        onRaceSelected: function () {
            this.raceType = $('input:radio[name=race]:checked').val();
            this.dispatcher.trigger(this.dispatcher.Events.ON_RACE_SELECTED, {meters: this.getRaceDistance(this.raceType)});
        },

        getRaceDistance: function (race) {
            var distance;
            switch (race) {
                case this.MARATHON:
                    distance = 42164.81;
                    break;
                case this.HALF_MARATHON:
                    distance = 21082.41;
                    break;
                case this.FIVE_K:
                    distance = 5000;
                    break;
                default:
                    distance = 0;
                    break;
            }
            return distance;
        }

    });
    return Demo8RightSideView;
});
