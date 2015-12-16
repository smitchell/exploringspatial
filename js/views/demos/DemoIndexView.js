define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Demos',
    'text!templates/demos/DemoIndexView.html',
    'text!templates/demos/DemoIndexItem.html',
    'domReady!'
], function ($, _, Backbone, Demos, templateHtml, itemTemplateHtml) {
    var DemoIndexView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.itemsTemplate = _.template(itemTemplateHtml);
            this.collection = new Demos();
            var _this = this;
            this.$el.html(this.template());
            var $items = this.$('.items');
            $items.html("<div class='loading'></div>");
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
            this.$el.html(this.template());
            var $items = this.$('.items');
            var demo;
            for (var i = this.collection.length - 1; i >= 0; i--) {
                demo = this.collection.models[i];
                if (demo.get('status') == 'Published') {
                    if (i < this.collection.length - 1) {
                        $items.append('<hr/>');
                    }
                    $items.append(this.itemsTemplate(this.collection.models[i].toJSON()));
                }
            }
        }

    });
    return DemoIndexView;
});
