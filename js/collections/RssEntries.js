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

	initialize: function() {
		this.feed = new google.feeds.Feed("https://exploringspatial.wordpress.com/feed/");
	},

	fetch: function() {
		var _this = this;
		this.feed.load(function(result) {
			var models = [];
			if (!result.error) {
				var entry;
				for (var i = 0; i < result.feed.entries.length; i++) {
					entry = result.feed.entries[i];
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
				}
			}
			_this.reset(models);
		});
	}
});

    return RssEntries;
});
