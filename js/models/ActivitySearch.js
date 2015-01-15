/**
 * ActivitySearch is a Backbone model representing Activity search criteria.
 *
 */
define([
    'backbone'
], function (Backbone) {
    var ActivitySearch = Backbone.Model.extend({
        defaults: {
            name: '',
            minDate: '',
            maxDate: '',
            minDistance: '',
            maxDistance: ''
        },

        filterActivityJson: function (feature) {
            var featureProperties = feature.properties;
            if (!this.matchStrings(featureProperties, 'name')) {
                return false;
            }
            var minDistance = this.get('minDistance');
            var maxDistance = this.get('maxDistance');
            if (minDistance != null && maxDistance != null && minDistance != '' && maxDistance != '') {
                var value = this.getFeatureProperty(featureProperties, 'totalMeters');
                if (value != null) {
                    var miles =value * 0.000621371;
                    if (miles < minDistance || miles >  maxDistance) {
                        return false;
                    }
                }
            }
            var minDate = this.get('minDate');
            var maxDate = this.get('maxDate');
            if (minDate != null && maxDate != null && minDate != '' && maxDate != '') {
                value = this.getFeatureProperty(featureProperties, 'startDate');
                if (value != null) {
                    var startDate = new Date(value);
                    if (startDate < Date.parse(minDate) || startDate > Date.parse(maxDate)) {
                        return false;
                    }
                }
            }
            return true;
        },

        matchStrings: function (featureProperties, propertyName) {
            var criteria = this.get(propertyName);
            if (criteria == null || criteria.length == 0) {
                return true;
            } else {
                var value = this.getFeatureProperty(featureProperties, propertyName);
                if (value != null) {
                    return value.toLowerCase().indexOf(criteria.toLowerCase()) > -1;
                }
            }
            return false
        },

        getFeatureProperty: function (featureProperties, propertyName) {
            var value = null;
            if (typeof featureProperties != 'undefined') {
                value = featureProperties[propertyName];
                if (value == 'undefined' || value.length == 0) {
                    return null;
                }
            }
            return value;
        }
    });

    return ActivitySearch;
});
