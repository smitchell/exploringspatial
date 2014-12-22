define([
    'jquery',
    'underscore',
    'backbone',
    'collections/RssEntries',
    'views/home/RssEntryView',
    'text!templates/home/HomeLeftSideView.html'
], function ($, _, Backbone, RssEntries, RssEntryView, templateHtml) {
    var HomeLeftSideView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.collection = new RssEntries();
            this.collection.on('reset', this.render, this);
            this.collection.fetch();
        },
        render: function () {
            this.$el.html(this.template({}));
            var i = 0;
            var list = this.$('#posts-feed');
            this.collection.each(function(rssEntry) {
                if (i++ < 6) {
                    new RssEntryView({model: rssEntry, el: list});
                }
            });
        }
    });
    return HomeLeftSideView;
});
