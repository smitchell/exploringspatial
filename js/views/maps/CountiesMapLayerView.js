/**
 * The purpose of the CountyMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'jquery',
    'backbone',
    'leaflet',
    'leaflet_pip'
], function ($, Backbone, L, leafletPip) {

    var CountiesMapLayerView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.countiesLayer = null;
            this.collection = args.collection;
            this.dispatcher = args.dispatcher;

            this.defaultStyle = {
                color: "#2262CC",
                weight: 2,
                opacity: 0.6,
                fillOpacity: 0.1,
                fillColor: "#2262CC"
            };

            this.highlightStyle = {
                color: '#2262CC',
                weight: 3,
                opacity: 0.6,
                fillOpacity: 0.65,
                fillColor: '#2262CC'
            };
            this.render();
        },

        render: function () {
            if (this.countiesLayer != null && this.map.hasLayer(this.countiesLayer)) {
                this.map.removeLayer(this.countiesLayer);
            }
            var _this = this;
            this.countiesLayer = L.geoJson(this.collection.toJSON(),
                {
                    style: _this.defaultStyle,
                    onEachFeature: function (feature, layer) {
                        _this.onEachFeature(feature, layer);
                    }
                });
            this.map.addLayer(this.countiesLayer);

            this.dispatcher.on(this.dispatcher.Events.ON_LIST_MOUSEOVER, this.onListMouseover, this);
            this.dispatcher.on(this.dispatcher.Events.ON_LIST_MOUSEOUT, this.onListMouseout, this);


            var overlays = L.layerGroup().addTo(this.map);
            var kuCountry = L.circle([38.95734, -95.24507], 60000, {
                color: '#0000FF',
                fillColor: '#6666FF',
                weight: 1,
                fillOpacity: 0.5
            }).addTo(overlays);
            kuCountry.on({
                mouseover: function (event) {
                    kuCountry.setStyle({
                        fillOpacity: 0.85
                    })
                },
                mouseout: function (event) {
                    kuCountry.setStyle({
                        fillOpacity: 0.5
                    })
                }
            }, kuCountry);

            var kStateCountry = L.circle([39.191479, -96.580918], 60000, {
                color: '#6600CC',
                fillColor: '#944DDB',
                weight: 1,
                fillOpacity: 0.5
            }).addTo(overlays);
            kStateCountry.on({
                mouseover: function (event) {
                    kStateCountry.setStyle({
                        fillOpacity: 0.85
                    })
                },
                mouseout: function (event) {
                    kStateCountry.setStyle({
                        fillOpacity: 0.5
                    })
                }
            }, kStateCountry);

            var wsuCountry = L.circle([37.718879, -97.293484], 60000, {
                color: '#FF9900',
                fillColor: '#FFC266',
                weight: 1,
                fillOpacity: 0.5
            }).addTo(overlays);
            wsuCountry.on({
                mouseover: function (event) {
                    wsuCountry.setStyle({
                        fillOpacity: 0.85
                    })
                },
                mouseout: function (event) {
                    wsuCountry.setStyle({
                        fillOpacity: 0.5
                    })
                }
            }, wsuCountry);

            this.map.on("mousemove", function (event) {
                var latlng = event.latlng;
                // Broadcast mouseout to all layers
                _this.countiesLayer.fireEvent("mouseout", {
                    latlng: latlng,
                    layerPoint: event.layerPoint,
                    containerPoint: event.containerPoint,
                    originalEvent: event.originalEvent,
                    layer: _this.countiesLayer
                });

                // Use Mapbox Leaflet PIP (point in polygon) library.
                var layers = leafletPip.pointInLayer(latlng, _this.countiesLayer);
                layers.forEach(function (layer) {
                    _this.countiesLayer.fireEvent("mouseover", {
                        latlng: latlng,
                        layerPoint: event.layerPoint,
                        containerPoint: event.containerPoint,
                        originalEvent: event.originalEvent,
                        layer: layer
                    });
                });
            });
        },

        onListMouseover: function (args) {
            var _this = this;
            this.countiesLayer.eachLayer(function (layer) {
                if (layer.feature.properties.geoid == args.geoid) {
                    layer.setStyle(_this.highlightStyle)
                }
            });
        },

        onListMouseout: function (args) {
            var _this = this;
            this.countiesLayer.eachLayer(function (layer) {
                if (layer.feature.properties.geoid == args.geoid) {
                    layer.setStyle(_this.defaultStyle)
                }
            });
        },

        onEachFeature: function (feature, layer) {
            layer.setStyle(this.defaultStyle);
            var _this = this;
            layer.on({
                mouseover: _this.onMouseover,
                mouseout: _this.onMouseout
            }, _this);

        },

        onMouseover: function (event) {
            event.layer.setStyle(this.highlightStyle);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LAYER_MOUSEOVER, {geoid: event.target.feature.properties.geoid});
        },

        onMouseout: function (event) {
            event.layer.setStyle(this.defaultStyle);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LAYER_MOUSEOUT, {geoid: event.target.feature.properties.geoid});
        }
    });
    return CountiesMapLayerView;
});
