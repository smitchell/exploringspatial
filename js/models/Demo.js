/**
 * Demo is a Backbone model representing a site Demo description.
 */
define([
    'backbone'
], function (Backbone) {
    var Demo = Backbone.Model.extend({
        initialize: function() {
            this.validateDemoId();
            this.on( "change:demoId", this.validateDemoId, this );
        },

        validateDemoId: function() {
            var demoId = this.get('demoId');
            if (typeof demoId != 'undefined' && demoId != null && demoId.length > 0) {
                if (!this.isNumeric(demoId)) {
                    var numberVal = Number(demoId);
                    if (isNaN(numberVal)) {
                        throw Error('DemoId must be numeric')
                    }
                    this.set({'demoId': Number(demoId) }, {silent: true});
                }
            }
        },

        /**
         * This was lifted from JQuery
         * http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
         * @param obj
         * @returns {boolean}
         */
        isNumeric: function( obj ) {
            return !$.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
        }

    });

    return Demo;
});
