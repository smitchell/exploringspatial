/**
 * ArmedConflictLocations is a Backbone Collection of ArmedConflictLocation Backbone Models.
 * Each model represents a single location of armed conflict.
 */
define([
        'backbone',
        'models/acled/ArmedConflictLocation'
], function(Backbone, ArmedConflictLocation) {
var ArmedConflictLocations = Backbone.Collection.extend({

    countryName: 'not set',
    
	model: ArmedConflictLocation,

    url: function() {return "data/acled/" + this.countryName + "/index";},

	/**
	 * Override Backbone parse to convert properties of properties into child Backbone models.
	 * @param data
	 * @returns {{}}
	 */
	parse: function (data) {
		this.type = data.type;
		this.crs = data.crs;
		return data.features;
	},

	/**
	 * Override Backbone toJSON to return child Backbone models into properties of properties.
	 */
	toJSON: function() {
		var json = {};
		json.type = this.type;
		json.crs = this.crs;
		json.features = [];
		this.each(function(feature){
			json.features.push(feature.toJSON());
		});
		return json;
	}

});

    return ArmedConflictLocations;
});
