/**
 * MapLayer is a Backbone model representing a specific type of map layer.
 */
define([
    'backbone'
], function (Backbone) {
    var MapLayer = Backbone.Model.extend({

        /**
         * The purpose of the initialize is to wire-up the model change event to the MapEventDispatcher.
         * Specifically, when the isSelected property of any MapLayer instance is changed from false to true
         * it will fire the ON_LAYER_CHANGED event.
         * @param args
         */
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:isSelected', this.onBaseLayerChanged, this);
        },

        /**
         * The purpose of this function is to fire the BASE_LAYER_CHANGED if this is
         * a base layer and isSelected is set to true
         */
        onBaseLayerChanged: function() {
            if (this.get('isBaseLayer') && this.get('isSelected')) {
                this.dispatcher.trigger(this.dispatcher.Events.BASE_LAYER_CHANGED, {mapLayer: this});
            }
        }
    });
    MapLayer.ROAD = 'road';
    MapLayer.SATELLITE = 'satellite';
    MapLayer.TERRAIN = 'terrain';
    MapLayer.HYBRID = 'hybrid';
    MapLayer.TRAILS = 'trails';
    return MapLayer;
});
