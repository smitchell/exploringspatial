/**
 * ActivitySearch is a Backbone model representing Activity search criteria.
 *
 */
define([
    'backbone'
], function (Backbone) {
    var AcledSearch = Backbone.Model.extend({
        defaults: {
            countryPk: -1,
            locationPk: -1,
            actorTypePk: -1,
            eventTypePk: -1,
            minDate: '',
            maxDate: '',
            minFatalities: '',
            maxFatalities: ''
        },

        filterMarker: function (featureProperties) {
            if (!this.matchValue(featureProperties, 'countryPk')
                || !this.matchValue(featureProperties, 'locationPk')
                || !this.matchValue(featureProperties, 'eventTypePk')) {
                return true;
            }
            var actorTypePk = this.get('actorTypePk');
            var actor1 = this.getFeatureProperty(featureProperties, 'actor1Pk');
            var actor2 = this.getFeatureProperty(featureProperties, 'actor2Pk');
            if (actorTypePk != null && actorTypePk != -1
                && actor1 != actorTypePk
                && actor2 != actorTypePk) {
                return true;
            }
            var minFatalities = this.get('minFatalities');
            if (minFatalities != null && minFatalities != ''
                && this.getFeatureProperty(featureProperties, 'fatalities') < minFatalities) {
                return true;
            }
            var maxFatalities = this.get('maxFatalities');
            if (maxFatalities != null && maxFatalities != ''
                && this.getFeatureProperty(featureProperties, 'fatalities') > maxFatalities) {
                return true;
            }
            var minDate = this.get('minDate');
            var eventDate = new Date(this.getFeatureProperty(featureProperties, 'eventDate'));
            if (minDate != null && minDate != ''
                && eventDate < minDate) {
                return true;
            }
            var maxDate = this.get('maxDate');
            if (maxDate != null && maxDate != ''
                && eventDate > maxDate) {
                return true;
            }
            return false;
        },

        matchValue: function (featureProperties, propertyName) {
            var criteria = this.get(propertyName);
            if (criteria == null || criteria.length == 0 || criteria == -1) {
                return true;
            }
            return criteria == this.getFeatureProperty(featureProperties, propertyName);
        },

        getFeatureProperty: function (featureProperties, propertyName) {
            var value = null;
            if (typeof featureProperties != 'undefined') {
                value = featureProperties[propertyName];
                if (typeof value == 'undefined' || value.length == 0) {
                    return null;
                }
            }
            return value;
        }
    });

    return AcledSearch;
});
