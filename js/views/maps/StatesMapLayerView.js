/**
 * The purpose of the StatesMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'jquery',
    'backbone',
    'leaflet',
    'leaflet_pip'
], function ($, Backbone, L, leafletPip) {

    var StatesMapLayerView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.statesLayer = null;
            this.collection = args.collection;
            this.dispatcher = args.dispatcher;
            this.dispatcher.on(this.dispatcher.Events.ON_RACE_ADDED, this.onRaceAdded, this);
            this.dispatcher.on(this.dispatcher.Events.ON_RACE_SELECTED, this.onRaceSelected, this);
            this.dispatcher.on(this.dispatcher.Events.ON_RACE_ZOOMED, this.onRaceSelected, this);
            this.render();
        },

        render: function () {
            var _this = this;
            if (this.statesLayer != null && this.map.hasLayer(this.statesLayer)) {
                this.statesLayer.getLayers().forEach(function (layer) {
                    _this.statesLayer.removeLayer(layer);
                });
                this.map.removeLayer(this.statesLayer);
            }

            this.statesLayer = L.geoJson(this.collection.toJSON(), {style: {weight: 1}}).addTo(this.map);
        },

        // Unhighlight the previously selected states.
        onRaceSelected: function() {
            var _self = this;
            if (this.statesLayer != null) {
                this.statesLayer.getLayers().forEach(function (layer) {
                    _self.statesLayer.resetStyle(layer);
                });
            }
        },

        // Highlight matching states
        onRaceAdded: function(event) {
            var latLng = event.latLng;
            if (latLng && this.statesLayer != null) {
                // Use the Leaflet-PIP (point in polygon) library to find any state
                // layers containing the race start point.
                var layers = leafletPip.pointInLayer(latLng, this.statesLayer);

                // Highlight any matches (there should be just one);
                layers.forEach(function (layer) {
                    layer.setStyle({color: '#FF0022'});
                });
            }
        }

    });
    return StatesMapLayerView;
});
