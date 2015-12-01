/**
 * Activities is a Backbone Collection of Activity Backbone Models.
 * Each model represents a single activity from a Garmin device..
 */
define([
        'backbone',
        'models/GeoJsonFeature'
], function(Backbone, GeoJsonFeature) {
var Counties = Backbone.Collection.extend({
	state: 'ks',
	url: "http://data.exploringspatial.com/states/ks/counties",
	model: GeoJsonFeature,

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
	},

    comparator: function( collection ){
        return( collection.get( 'properties').get('name') );
    },

	getState: function() {
		return this.state;
	},

	setState: function(state) {
		this.state = state;
	}

});

    return Counties;
});
