define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/DemoDescriptionView.html',
    'text!demos/demo1/templates/DemoDescriptionView.html'
], function ($, _, Backbone, templateHtml, template1Html) {
    var DemoDescriptionView = Backbone.View.extend({

        events: {
            'click #boxclose a': 'closeOverlay'
        },

        initialize: function (args) {
            this.demoId = args.demoId;
            this.template = _.template(templateHtml);
            switch (this.demo1) {
                case 1:
                {
                    this.demoTemplate = _.template(template1Html);
                    break;
                }
            }
            this.render();
        },

        render: function () {
            $('body').append(this.template());
            $('.overlay').show();
            var _this = this;
            var boxClose = $('#boxclose');
            boxClose.click(function (event) {
                _this.destroy();
                event.stopPropagation();
           		return false;
            });
        },

        destroy: function() {
            $('#boxclose').unbind('click');
            $('.overlay').remove();
        }
    });
    return DemoDescriptionView;
});
