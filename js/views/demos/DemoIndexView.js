define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Demos',
    'text!templates/demos/DemoIndexView.html',
    'domReady!'
], function ($, _, Backbone, Demos, templateHtml) {
    var DemoIndexView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.collection = new Demos();
            var _this = this;
            this.$el.html("<div id='container2'> <h1 style='color: white;'>Index of Demos</h1> </div><div class='items'><div class='loading'>Loading...</div></div>");
            this.collection.fetch({
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

            var $items = this.$('.items');
            $items.empty();
            for (var i = this.collection.length - 1; i >= 0; i--) {
                $items.append(this.template(this.collection.models[i].toJSON()));
            }
        }

    });
    return DemoIndexView;
});
