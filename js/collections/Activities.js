/**
 * RssEntries is a Backbone Collection of RssEntry Backbone Models.
 * Each model represents a single entry from an RSS feed.
 */
define([
        'backbone',
        'models/Activity'
], function(Backbone, Activity) {
var RssEntries = Backbone.Collection.extend({
	url: "activities",
	model: Activity,

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

    return RssEntries;
});
