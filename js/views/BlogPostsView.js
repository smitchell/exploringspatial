define([
    'jquery',
    'underscore',
    'backbone',
    'collections/BlogPosts',
    'text!templates/BlogPostsView.html',
    'text!templates/BlogPostView.html'
], function ($, _, Backbone, BlogPosts, templateHtml, itemHtml) {
    var BlogPostsView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.blogPostTemplate = _.template(itemHtml);
            this.fetchData();
        },

        fetchData: function () {
            this.$el.html(this.template());
            var $items = this.$('.items');
            $items.html("<div class='loading'></div>");
            var _this = this;
            this.blogPosts = new BlogPosts();
            this.blogPosts.fetch({
                success: function () {
                    _this.render();
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function () {
            this.$el.html(this.template());
            var $items = this.$('.items');
            var model, month, day, year;
            var _this = this;
            this.blogPosts.each(function (blogPost) {
                model = blogPost.toJSON();
                var d = blogPost.get('date');
                if (d) {
                    month = '' + (d.getMonth() + 1);
                    day = '' + d.getDate();
                    year = d.getFullYear();
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    if (day.length < 2) {
                        day = '0' + day;
                    }

                    model.date = [month, day, year].join('/');

                }
                $items.append(_this.blogPostTemplate(model));
            });
        }
    });
    return BlogPostsView;
});
