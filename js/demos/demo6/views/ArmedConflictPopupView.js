define([
    'jquery',
    'underscore',
    'backbone',
    'text!demos/demo6/templates/ArmedConflictPopupView.html'
], function ($, _, Backbone, templateHtml) {
    var ArmedConflictPopupView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
        },
        render: function () {
            var json = this.model.get('properties').toJSON();
            if (typeof json.eventDate != 'undefined') {
                json.eventDate = new Date(json.eventDate).toLocaleDateString();
            }
            return this.template({properties: json});
        },

        destroy: function() {
            // Remove view from DOM
            this.remove();
        }
    });
    return ArmedConflictPopupView;
});
