/**
 * The purpose of the CountiesMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'jquery',
    'backbone',
    'leaflet_pip'
], function ($, Backbone, leafletPip) {

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
            this.dispatcher.on(this.dispatcher.Events.LIST_MOUSEOVER, this.onListMouseover, this);
            this.dispatcher.on(this.dispatcher.Events.LIST_MOUSEOUT, this.onListMouseout, this);
            var _this = this;
            $(window).resize (function() {
                if (_this.map && _this.countiesLayer) {
                    _this.map.fitBounds(_this.countiesLayer);
                }
            })
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
                }).addTo(this.map);
            this.addCollegeOverlays();
            this.map.fitBounds(this.countiesLayer);
        },

        addCollegeOverlays: function() {
            var _this = this;
            var overlays = L.featureGroup().addTo(this.map).on('mouseover', function (event) {
                event.layer.setStyle({
                    fillOpacity: 0.50
                });
                _this.showLogo(event.layer.options.className);
            }).on('mouseout', function (event) {
                event.layer.setStyle({
                    fillOpacity: 0.5
                });
                _this.clearLogo();
                _this.unhighlightCounties(event);
            }).on('mousemove', function(event) {

                // Broadcast mouseout to all layers
                _this.unhighlightCounties(event);

                // Use the Leaflet-PIP (point in polygon) library to find any county
                // layers containing the point of the circle's mousemove event.
                var layers = leafletPip.pointInLayer(event.latlng, _this.countiesLayer, true);

                // Highlight any matches (there should be just one), by firing its mouseover event.
                layers.forEach(function (layer) {
                    layer.fireEvent("mouseover", {
                        latlng: event.latlng,
                        layerPoint: event.layerPoint,
                        containerPoint: event.containerPoint,
                        originalEvent: event.originalEvent,
                        layer: layer,
                        target: layer
                    });
                });
            });
            L.circle([38.95734, -95.24507], 60000, {
                color: '#0000FF',
                fillColor: '#6666FF',
                weight: 1,
                fillOpacity: 0.5,
                className: "ku"
            }).addTo(overlays);
            L.circle([39.191479, -96.580918], 60000, {
                color: '#6600CC',
                fillColor: '#944DDB',
                weight: 1,
                fillOpacity: 0.5,
                className: "ksu"
            }).addTo(overlays);

            L.circle([37.718879, -97.293484], 60000, {
                color: '#FF9900',
                fillColor: '#FFC266',
                weight: 1,
                fillOpacity: 0.5,
                className: "wsu"
            }).addTo(overlays);
        },

        unhighlightCounties: function(event) {
            this.countiesLayer.getLayers().forEach(function (layer) {
                layer.fireEvent("mouseout", {
                    latlng: event.latlng,
                    layerPoint: event.layerPoint,
                    containerPoint: event.containerPoint,
                    originalEvent: event.originalEvent,
                    target: layer,
                    layer: layer
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
            event.target.setStyle(this.highlightStyle);
            this.dispatcher.trigger(this.dispatcher.Events.LAYER_MOUSEOVER, {
                type: this.dispatcher.Events.LAYER_MOUSEOVER,
                geoid: event.target.feature.properties.geoid
            });
        },

        onMouseout: function (event) {
            event.target.setStyle(this.defaultStyle);
            this.dispatcher.trigger(this.dispatcher.Events.LAYER_MOUSEOUT, {
                type: this.dispatcher.Events.LAYER_MOUSEOUT,
                geoid: event.target.feature.properties.geoid
            });
        },
        clearLogo: function () {
            var logo = $('.logo');
            logo.removeClass("ku");
            logo.removeClass("ksu");
            logo.removeClass("wsu");
        },

        showLogo: function(className) {
            this.clearLogo();
            if (className) {
                $('.logo').addClass(className);
            }
        }
    });
    return CountiesMapLayerView;
});
