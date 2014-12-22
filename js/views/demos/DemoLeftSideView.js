define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/DemoLeftSideView.html'
], function ($, _, Backbone, templateHtml) {
    var Demo1LeftSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.expanded = args.expanded;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
            this.$('.demoNarrative').hide();
            this.$(this.expanded).show();
        }
    });
    return Demo1LeftSideView;
});
