define([
    'jquery',
    'underscore',
    'backbone',
    'collections/BlogPosts',
    'collections/SearchResults',
    'collections/Demos',
    'models/SearchResult',
    'text!templates/SearchPageView.html',
    'text!templates/SearchResultView.html'
], function ($, _, Backbone, BlogPosts, SearchResults, Demos, SearchResult, templateHtml, searchResultHtml) {
    var SearchPageView = Backbone.View.extend({

        initialize: function () {
            this.template = _.template(templateHtml);
            this.searchResultTemplate = _.template(searchResultHtml);
            this.searchesRunning = 0;
            this.collection = new SearchResults();
        },

        fetchData: function (keywords) {
            this.$el.html(this.template());
            this.collection.reset();
            this.$('.items').html("<div class='loading'></div>");
            var _this = this;
            this.blogPosts = new BlogPosts();
            this.blogPosts.searchString = keywords.split('+').join(',');
            this.searchesRunning += 1;
            this.blogPosts.fetch({
                success: function () {
                    _this.searchesRunning -= 1;
                    var model, month, day, year;
                    _this.blogPosts.each(function (blogPost) {
                        var blogJSON = blogPost.toJSON();
                        var model = {};
                        model.title = blogJSON.title;
                        model.description = blogJSON.excerpt;
                        model.url = blogJSON.URL;
                        model.date = blogPost.get('date');
                        model.iconClass = 'wordpress';
                        _this.collection.add(new SearchResult(model));
                    });
                    _this.checkCompleted();
                },
                error: function (object, xhr, options) {
                    _this.searchesRunning -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                    _this.checkCompleted();
                }
            });

            this.searchesRunning += 1;
            this.demos = new Demos();
            var matches = [];
            this.demos.fetch({
                success: function () {
                    _this.searchesRunning -= 1;
                    var content;
                    _this.demos.each(function (demo) {
                        content = demo.get('title').toLowerCase() + demo.get('description').toLowerCase();
                        var index;
                        $.each(keywords.toLowerCase().split('+'), function (index, keyword) {
                            index = content.indexOf(keyword);
                            if (index > -1) {
                                var isUnmatched = _this.isUnmatched(demo, matches);
                                if (isUnmatched) {
                                    matches.push(demo);
                                }
                            }
                        });
                    });
                    $.each(matches, function (i, match) {
                        var matchJSON = match.toJSON();
                        var model = {};
                        model.title = matchJSON.title;
                        model.description = matchJSON.description;
                        model.url = matchJSON.href;
                        var parts = matchJSON.created.split('/');
                        model.date = new Date(parseInt(parts[2], 10),
                            parseInt(parts[0], 10) - 1,
                            parseInt(parts[1], 10));
                        model.iconClass = 'demo';
                        _this.collection.add(new SearchResult(model));
                    });
                    _this.checkCompleted();
                },
                error: function (object, xhr, options) {
                    _this.searchesRunning -= 1;
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                    _this.checkCompleted();
                }
            });
        },

        render: function () {
            var _this = this;
            this.collection.sort();
            this.collection.each(function (searchResult) {
                var json = searchResult.toJSON();
                var d = searchResult.get('date');
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

                    json.date = [month, day, year].join('/');

                }
                _this.$('.items').append(_this.searchResultTemplate(json));
            })
        },

        isUnmatched: function (demo, matches) {
            var unmatched = true;
            $.each(matches, function (i, existingDemo) {
                if (demo.get('demoId') == existingDemo.get('demoId')) {
                    unmatched = false;
                }
            });
            return unmatched;
        },

        checkCompleted: function () {
            if (this.searchesRunning < 1) {
                this.render();
                this.$('.loading').remove();
            }
        }

    });
    return SearchPageView;
});
