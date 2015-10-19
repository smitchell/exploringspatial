/**
 * The purpose of the CountyMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'jquery',
    'backbone',
    'leaflet'
], function ($, Backbone) {

    var CountyMapLayerView = Backbone.View.extend({
        labelLayer: null,

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
            var _this = this;
            event.layer.setStyle(this.highlightStyle);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LAYER_MOUSEOVER, {geoid: event.target.feature.properties.geoid});
            //var center = event.layer.getBounds().getCenter();
            //var text = event.target.feature.properties['name'];
            //this.label = L.marker(center, {icon: this.createLabelIcon('county-name-label', text)})
            //this.label.on({
            //                mouseover: _this.onMouseover,
            //                mouseout: _this.onMouseout
            //            }, _this);
            //this.map.addLayer(this.label);
        },

        onMouseout: function (event) {
            event.layer.setStyle(this.defaultStyle);
            this.dispatcher.trigger(this.dispatcher.Events.ON_LAYER_MOUSEOUT, {geoid: event.target.feature.properties.geoid});
            //if (this.label && this.label != null) {
            //    try {
            //        this.map.removeLayer(this.label);
            //    } catch (e) {
            //        // ignore
            //    }
            //    this.delete = null;
            //}
        },

        createLabelIcon: function (labelClass, labelText) {
            return L.divIcon({
                className: labelClass,
                html: labelText
            })
        }
    });
    return CountyMapLayerView;
});