define([
        'backbone',
        'models/MapProvider'
], function(Backbone, MapProvider) {
var MapProviders = Backbone.Collection.extend({
	model: MapProvider,
	findByName: function(name) {
		var result = null;
		this.each(function(mapProvider) {
			if (mapProvider.get('name') == name) {
				result = mapProvider;
			}
		});
		return result;
	},
	changeCurrentProvider: function(name) {
		var currentProvider = null;
		this.each(function(mapProvider) {
			if (mapProvider.get('name') == name) {
				mapProvider.set({currentProvider: true });
				currentProvider = mapProvider;
			} else {
				mapProvider.set({currentProvider: false });
			}
		});
		return currentProvider;
	},
	getCurrentProvider: function() {
		var result = null;
		this.each(function(mapProvider) {
			if (mapProvider.get('currentProvider') == true) {
				result = mapProvider;
			}
		});
		return result;
	}
});

    return MapProviders;
});
