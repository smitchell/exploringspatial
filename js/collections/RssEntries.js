/**
 * RssEntries is a Backbone Collection of RssEntry Backbone Models.
 * Each model represents a single entry from an RSS feed.
 */
define([
        'backbone',
        'models/RssEntry'
], function(Backbone, RssEntry) {
var RssEntries = Backbone.Collection.extend({
	model: RssEntry,

	initialize: function(args) {
		this.feed = new google.feeds.Feed("https://exploringspatial.wordpress.com/feed/");
	},

	fetch: function() {
		var self = this;
		this.feed.load(function(result) {
			var models = [];
			if (!result.error) {
                $.each(result.feed.entries, function(index, entry) {
                    models.push(new RssEntry({
                        author: entry.author,
                        categories: entry.categories,
                        content: entry.content,
                        contentSnippet: entry.contentSnippet,
                        link: entry.link,
                        mediaGroups: entry.mediaGroups,
                        publishedDate: new Date(entry.publishedDate).toLocaleDateString(),
                        title: entry.title
                    }));
                });
			}
			self.reset(models);
		});
	}
});

    return RssEntries;
});
