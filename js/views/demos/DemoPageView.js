define([
    'jquery',
    'underscore',
    'backbone',
    'demos/demo1/views/DemoPageView',
    'demos/demo2/views/DemoPageView',
    'demos/demo3/views/DemoPageView',
    'demos/demo4/views/DemoPageView',
    'demos/demo5/views/DemoPageView',
    'demos/demo6/views/DemoPageView',
    'demos/demo7/views/DemoPageView',
    'demos/demo8/views/DemoPageView',
    'demos/demo9/views/DemoPageView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone,
             Demo1PageView, 
             Demo2PageView, 
             Demo3PageView, 
             Demo4PageView, 
             Demo5PageView, 
             Demo6PageView, 
             Demo7PageView,
             Demo8PageView,
             Demo9PageView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({
        initialize: function (args, demoId) {
            //this.template = _.template(templateHtml);
            //this.$el.html(this.template({}));
            this.args = args;
        },
        render: function (demoId) {
            switch(Number(demoId)) {
                case 1:
                    new Demo1PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 2:
                    new Demo2PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 3:
                    new Demo3PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 4:
                    new Demo4PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 5:
                    new Demo5PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 6:
                    new Demo6PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 7:
                    new Demo7PageView({el: this.$el, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 8:
                    new Demo8PageView({el: this.$el, mapWidth: 650, mapHeight: 350});
                    break;
                default:
                    demoId = 9;
                    new Demo9PageView({el: this.$el, mapWidth: 800, mapHeight: 250});
                    break;
            }
        }
    });
    return DemoPageView;
});
