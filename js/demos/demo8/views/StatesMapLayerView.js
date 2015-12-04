/**
 * The purpose of the StatesMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'jquery',
    'backbone',
    'leaflet_pip'
], function ($, Backbone, leafletPip) {

    var StatesMapLayerView = Backbone.View.extend({

        initialize: function (args) {
            this.maps = args.maps;
            this.mainlandLayer = null;
            this.collection = args.collection;
            this.dispatcher = args.dispatcher;

            this.render();
            this.dispatcher.on(this.dispatcher.Events.RACE_ADDED, this.onRaceAdded, this);
            this.dispatcher.on(this.dispatcher.Events.RACE_SELECTED, this.onRaceSelected, this);
            this.dispatcher.on(this.dispatcher.Events.RACE_ZOOMED, this.onRaceSelected, this);
            var _this = this;
            $(window).resize (function() {
                _this.maps['mainland'].fitBounds(_this.mainlandLayer.getBounds());
                _this.maps['alaska'].fitBounds(_this.alaskaLayer.getBounds());
                _this.maps['hawaii'].fitBounds(_this.hawaiiLayer.getBounds());
            });
        },

        render: function () {
            var mainland = this.maps['mainland'];
            var _this = this;
            if (this.mainlandLayer != null && this.mainlandMap.hasLayer(this.mainlandLayer)) {
                this.mainlandLayer.getLayers().forEach(function (layer) {
                    _this.mainlandLayer.removeLayer(layer);
                });
                mainland.removeLayer(this.mainlandLayer);
            }
            //adm1_code": "USA-3514"
            this.mainlandLayer = L.geoJson(this.collection.toJSON(), {
                filter: function (feature, layers) {
                    return feature.properties.adm1_code != "USA-3563" && feature.properties.adm1_code != "USA-3517";
                },
                style: {weight: 1}
            }).addTo(mainland);
            this.maps['mainland'].fitBounds(_this.mainlandLayer.getBounds());
            this.alaskaLayer = L.geoJson(this.collection.toJSON(), {
                filter: function (feature, layers) {
                    return feature.properties.adm1_code == "USA-3563";
                },
                style: {weight: 1}
            }).addTo(this.maps['alaska']);
            this.maps['alaska'].fitBounds(_this.alaskaLayer.getBounds());
            this.hawaiiLayer = L.geoJson(this.collection.toJSON(), {
                filter: function (feature, layers) {
                    return feature.properties.adm1_code == "USA-3517";
                },
                style: {weight: 1}
            }).addTo(this.maps['hawaii']);
            this.maps['hawaii'].fitBounds(_this.hawaiiLayer.getBounds());
        },

        // Unhighlight the previously selected states.
        onRaceSelected: function() {
            var _self = this;
            if (this.mainlandLayer != null) {
                this.mainlandLayer.getLayers().forEach(function (layer) {
                    _self.mainlandLayer.resetStyle(layer);
                });
            }
        },

        // Highlight matching state
        onRaceAdded: function(event) {
            var latLng = event.latLng; // Race starting location
            if (latLng && this.mainlandLayer != null) {
                // Use the Leaflet-PIP (point in polygon) library to find any state
                // layers containing the race start point.
                var layers = leafletPip.pointInLayer(latLng, this.mainlandLayer, true);

                // Highlight any matches (there should be just one);
                layers.forEach(function (layer) {
                    layer.setStyle({color: '#FF0022'});
                });
            }
        }

    });
    return StatesMapLayerView;
});
