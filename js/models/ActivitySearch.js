/**
 * ActivitySearch is a Backbone model representing Activity search criteria.
 *
 */
define([
    'backbone'
], function (Backbone) {
    var ActivitySearch = Backbone.Model.extend({
        defaults: {
            name: ''
        }
    });
    return ActivitySearch;
});
