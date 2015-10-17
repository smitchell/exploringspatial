define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/DemoLeftSideView.html'
], function ($, _, Backbone, templateHtml) {
    var DemoLeftSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.demoId = args.demoId;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
            this.expandDemo(this.demoId);
        },

        expandDemo: function(demoId) {
            this.demoId = demoId;
            this.$('.demoNarrative').hide();
            this.$('#demo' + demoId + 'Narrative').show();
        }

    });
    return DemoLeftSideView;
});
