/**
 * ActivityMeasurements is a Backbone Collection of ActivityMeasurement Backbone Models.
 * Each model represents a single record message from a Garmin FIT file.
 */
define([
        'backbone',
        'models/ActivityMeasurement'
], function(Backbone, ActivityMeasurement) {
var ActivityMeasurements = Backbone.Collection.extend({
    activityId: '',

	url: function() {
        return "http://data.exploringspatial.com/measurements/" + this.activityId;
    },
	model: ActivityMeasurement,

	/**
	 * Override Backbone parse to convert properties of properties into child Backbone models.
	 * @param data
	 * @returns {{}}
	 */
	parse: function (data) {
		var models = [];
        $.each(data.measurements, function(i, measurement){
            models.push(new ActivityMeasurement(measurement));
        });
        return models;
	},

    setActivityId: function(activityId) {
        this.activityId = activityId;
    }

});

    return ActivityMeasurements;
});
