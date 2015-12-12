define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/MenuView.html'
], function ($, _, Backbone, templateHtml) {
    var MenuView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));


        },
        changeMenu: function(route) {
            this.$('.home').removeClass('YouAreHere');
            this.$('.blogs').removeClass('YouAreHere');
            this.$('.about').removeClass('YouAreHere');
            this.$('.demos').removeClass('YouAreHere');
            var $title = $('title');
            switch(route) {
                case 'about':
                    $title.text('About Exploring Spatial');
                    this.$('.about').addClass('YouAreHere');
                    break;
                case 'blogs':
                    $title.text('Exploring Spatial Blog Posts');
                    this.$('.blogs').addClass('YouAreHere');
                    break;
                case 'demos':
                    $title.text('Exploring Spatial Demos');
                    this.$('.demos').addClass('YouAreHere');
                    break;
                default:
                    $title.text('Exploring Spatial Home');
                    this.$('.home').addClass('YouAreHere');
                    break;
            }
        }
    });
    return MenuView;
});
