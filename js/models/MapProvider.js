define([
        'backbone',
        'collections/MapLayers'
], function(Backbone, MapLayers) {
  var MapProvider = Backbone.Model.extend({
  });
    MapProvider.GOOGLE = 'google';
    MapProvider.BING = 'bing';
    MapProvider.OSM = 'osm';
  return MapProvider;
});
