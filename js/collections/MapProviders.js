/**
 * MapProviders is a Backbone Collection of MapProvider Backbone Models.
 * Each map API supported by this web site is given a MapProvider model
 * (e.g. Google, Bing, OSM, Stamen, Baidu, etc...)
 */
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
		var selectedProvider = null;
		var isChanged = false;
		this.each(function(mapProvider) {
			if (mapProvider.get('name') == name) {
				selectedProvider = mapProvider;
				// Only take action if the mapProvide is not already the current map provider.
				if(!mapProvider.get('isSelected')) {
					isChanged = true;
				}
			} else if (mapProvider.get('isSelected')){
				mapProvider.set({isSelected: false });
			}
		});
		// Defer switch until all other providers are set to false.
		if (isChanged != null) {
			selectedProvider.set({isSelected: true });
		}
		return selectedProvider;
	},
	getSelectedProvider: function() {
		var result = null;
		this.each(function(mapProvider) {
			if (mapProvider.get('isSelected')) {
				result = mapProvider;
			}
		});
		return result;
	}
});

    return MapProviders;
});
