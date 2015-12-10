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
            this.$el.html("<div id='container2'> <h1 style='color: white;'>Index of Demos</h1> </div><div class='demoIndex'></div>");
            var $demoIndex = this.$('.demoIndex');
            for (var i = this.collection.length - 1; i >= 0; i--) {
                if (i < this.collection.length - 1) {
                    $demoIndex.append('<hr/>');
                }
                $demoIndex.append(this.template(this.collection.models[i].toJSON()));
            }
        }

    });
    return DemoIndexView;
});
