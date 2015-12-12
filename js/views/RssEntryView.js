define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/RssEntryView.html'
], function ($, _, Backbone, templateHtml) {
    var RssEntryView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            var modelJson = this.model.toJSON();
            this.$el.append(this.template({model: modelJson}));
        }
    });
    return RssEntryView;
});
