define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/FooterView.html'
], function ($, _, Backbone, templateHtml) {
    var HomePageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.currentYear = this.initializeYear();
            this.render();
        },
        render: function () {
            this.$el.html(this.template({currentYear: this.currentYear}));
        },
        initializeYear: function() {
            var year = new Date().getYear();
            if (year <= 99) {
                this.currentYear = "19" + year;
            } else if (year > 99 && year < 2000) {
                year += 1900;
            }
            return year;
        }

    });
    return HomePageView;
});
