define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'demos/demo1/views/RightSideView',
    'demos/demo2/views/RightSideView',
    'demos/demo3/views/RightSideView',
    'demos/demo4/views/RightSideView',
    'demos/demo5/views/RightSideView',
    'demos/demo6/views/RightSideView',
    'demos/demo7/views/RightSideView',
    'demos/demo8/views/RightSideView',
    'demos/demo9/views/RightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, 
             DemoLeftSideView, 
             Demo1RightSideView, 
             Demo2RightSideView, 
             Demo3RightSideView, 
             Demo4RightSideView, 
             Demo5RightSideView, 
             Demo6RightSideView, 
             Demo7RightSideView,
             Demo8RightSideView,
             Demo9RightSideView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({
        initialize: function (args, demoId) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function (demoId) {
            switch(Number(demoId)) {
                case 1:
                    new Demo1RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 2:
                    new Demo2RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 3:
                    new Demo3RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 4:
                    new Demo4RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 5:
                    new Demo5RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 6:
                    new Demo6RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 7:
                    new Demo7RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
                case 8:
                    new Demo8RightSideView({el: $('#rightContainer'), mapWidth: 650, mapHeight: 350});
                    break;
                default:
                    demoId = 9;
                    new Demo9RightSideView({el: $('#rightContainer'), mapWidth: 800, mapHeight: 250});
                    break;
            }
            new DemoLeftSideView({el: $('#leftContainer'), demoId: demoId});
        }
    });
    return DemoPageView;
});
