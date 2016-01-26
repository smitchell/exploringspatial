define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/DemoDescriptionView.html',
    'text!templates/demos/DemoIndexItem.html'
], function ($, _, Backbone, templateHtml, template1Html) {
    var DemoDescriptionView = Backbone.View.extend({

        events: {
            'click #boxclose a': 'closeOverlay'
        },

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.demoTemplate = _.template(template1Html);
            this.render();
        },

        render: function () {
            $('body').append(this.template());
            $('.overlay').show();
            var self = this;
            var boxClose = $('#boxclose');
            boxClose.click(function (event) {
                self.destroy();
                event.stopPropagation();
           		return false;
            });
            $('.overlayPlaceholder').html(this.demoTemplate(this.model.toJSON()));
        },

        destroy: function() {
            $('#boxclose').unbind('click');
            $('.overlay').remove();
        }
    });
    return DemoDescriptionView;
});
