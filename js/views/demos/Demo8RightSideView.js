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
                isFiveK: this.isSelected(this.FIVE_K),
                mapWidth: this.args.mapWidth,
                mapHeight: this.args.mapHeight
            }));
            var osmLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            this.mainlandMap = L.map('map_mainland', {
                center: [38.5, -96],
                zoom: 4,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false
            });
            this.mainlandMap.addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));
            this.alaskaMap = L.map('map_alaska', {
                center: [65, -153.5],
                zoom: 3,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false
            });
            this.alaskaMap.addLayer(osmLayer);
            this.hawaiiMap = L.map('map_hawaii', {
                center: [20.344627, -157.939453],
                zoom: 5,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false
            });
            this.hawaiiMap.addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));
            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;
            new StatesMapLayerView({
                collection: this.states,
                mainlandMap: this.mainlandMap,
                alaskaMap: this.alaskaMap,
                hawaiiMap: this.hawaiiMap,
                dispatcher: this.dispatcher
            });
            new RacesMapLayerView({
                collection: this.activities,
                mainlandMap: this.mainlandMap,
                alaskaMap: this.alaskaMap,
                hawaiiMap: this.hawaiiMap,
                dispatcher: this.dispatcher,
                meters: this.getRaceDistance(this.raceType)
            });
        },

        isSelected: function (race) {
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
