/**
 * BlogPosts is a Backbone Collection of blog post SearchResult Backbone Models.
 * Each model represents a single blog posts from Wordpress.
 */
define([
        'backbone',
        'collections/SearchResults',
        'models/SearchResult'
], function(Backbone, SearchResults, SearchResult) {
var BlogPosts = Backbone.Collection.extend({
    model: SearchResult,

    baseUrl: "https://public-api.wordpress.com/rest/v1.1/sites/exploringspatial.wordpress.com/posts",

    url: function() {
        var url = [];
        url.push(this.baseUrl);
        var self = this;
        var i = 0;
        $.each(this.parameters, function(name, value){
            if (i++ == 0) {
                url.push('?');
            } else {
                url.push('&');
            }
            url.push(name);
            url.push('=');
            url.push(value);
        });
        if (this.searchString) {
            url.push('&search=');
            url.push(this.searchString);
        }
        url.push('&v=');
        url.push(new Date().getTime());
        return url.join('');

    },

	initialize: function(args) {
		this.parameters = {
            number: 100,          // The number of posts to return. Limit: 100. Default: 20.
            fields: 'ID,URL,date,title,excerpt,type, post_thumbnail' //post_thumbnail
        }
	},

    parse: function(response) {
        var posts = [];
        if (response.posts) {
            $.each(response.posts, function(i, post){
                // 2015-11-25T09:56:23-06:00
                if (post.date) {
                    try {
                        post.date = new Date(post.date);
                    } catch(e) {
                        if (console.log) {
                            console.log(e);
                        }
                    }
                }
                posts.push(new SearchResult(post));
            });
        }
        return posts;
    },

    setSearchString: function(searchString) {
        if (this.searchString) {
            delete this.searchString;
        }
        if (typeof searchString != 'undefined' && searchString.trim().length > 0) {
            // Replace spaces with pluses.
            var keywords = searchString.trim().split(' ');
            var keywordString = [];
            $.each(keywords, function (i, keyword) {
                if (keywordString.length > 0) {
                    keywordString.push('+');
                }
                keywordString.push(keyword);
            });
            if (keywordString.length > 0) {
                this.searchString = keywordString.join('');
            }
        }
    }
});

    return BlogPosts;
});
