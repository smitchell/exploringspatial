define([
    'jquery',
    'underscore',
    'backbone',
    'apps/MapEventDispatcher',
    'collections/Activities',
    'demos/demo8/collections/States',
    'demos/demo8/views/StatesMapLayerView',
    'demos/demo8/views/RacesMapLayerView',
    'text!demos/demo8/templates/Demo8PageView.html',
    'leaflet_google'
], function ($, _, Backbone, MapEventDispatcher, Activities, States, StatesMapLayerView, RacesMapLayerView, templateHtml) {
    var Demo8PageView = Backbone.View.extend({
        MARATHON: 'marathon',
        HALF_MARATHON: 'halfMarathon',
        FIVE_K: 'fiveK',

        events: {
            'change input:radio[name=race]': 'onRaceSelected'
        },

        initialize: function () {
            this.template = _.template(templateHtml);
            this.maps = {};
            this.raceType = this.MARATHON;
            this.fetchData();
        },

       fetchData: function() {
            this.states = new States();
            var self = this;
            this.states.fetch({
                success: function () {
                    self.onStatesFetched();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        onStatesFetched: function () {
            this.activities = new Activities();
            this.activities.url = 'http://data.exploringspatial.com/activities/kc-mitchell';
            var self = this;
            this.activities.fetch({
                success: function () {
                    self.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            this.$el.html(this.template({
                isMarathon: this.isSelected(this.MARATHON),
                isHalf: this.isSelected(this.HALF_MARATHON),
                isFiveK: this.isSelected(this.FIVE_K)
            }));
            this.sizeMaps();
            this.maps['mainland'] = L.map('map_mainland', {
                center: [38.5, -96],
                zoom: 4,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false,
                keyboard: false
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));

            this.maps['alaska'] = L.map('map_alaska', {
                center: [65, -153.5],
                zoom: 3,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false,
                keyboard: false
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));

            this.maps['hawaii'] = L.map('map_hawaii', {
                center: [20.344627, -157.939453],
                zoom: 5,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                dragging: false,
                keyboard: false
            }).addLayer(new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }));

            // Create a global dispatcher for non model/collection events.
            this.dispatcher = MapEventDispatcher;

            new StatesMapLayerView({
                collection: this.states,
                maps: this.maps,
                dispatcher: this.dispatcher
            });

            new RacesMapLayerView({
                collection: this.activities,
                maps: this.maps,
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
            this.dispatcher.trigger(this.dispatcher.Events.RACE_SELECTED, {
                type: this.dispatcher.Events.RACE_SELECTED,
                meters: this.getRaceDistance(this.raceType)
            });
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
        },

        sizeMaps: function () {
            var $mapBox = $('#detailsMapBox');
            var width = $mapBox.width();
            var height = $mapBox.height();
            var stateWidth = (width * 0.25);
            if (stateWidth < 25) {
                stateWidth = 25;
            }
            var stateHeight = (height * 0.5 - 10);
            if (stateHeight < 25) {
                stateHeight = 25;
            }
            var mainlandWidth = (width * 0.75) - 15;
            if (mainlandWidth < 25) {
                mainlandWidth = 25;
            }
            var mainlandHeight = stateHeight * 2 + 7;
            if (mainlandHeight < 50) {
                mainlandHeight = 50;
            }
            $('#map_alaska').css({left: '5px', width: stateWidth + 'px', height: stateHeight + 'px', top: '5px'});
            $('#map_hawaii').css({left: '5px', width: stateWidth + 'px', height: stateHeight + 'px', bottom: 0});
            $('#map_mainland').css({
                left: 10 + 'px',
                width: mainlandWidth + 'px',
                height: mainlandHeight + 'px',
                top: '5px'
            });
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        },

        getDemoId: function () {
            return 8;
        }
    });

    return Demo8PageView;
});
