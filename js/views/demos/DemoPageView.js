define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/Demo1RightSideView',
    'views/demos/Demo2RightSideView',
    'views/demos/Demo3RightSideView',
    'views/demos/Demo4RightSideView',
    'views/demos/Demo5RightSideView',
    'views/demos/Demo6RightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, 
             DemoLeftSideView, 
             Demo1RightSideView, 
             Demo2RightSideView, 
             Demo3RightSideView, 
             Demo4RightSideView, 
             Demo5RightSideView, 
             Demo6RightSideView, 
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
                default:
                    new Demo6RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
                    break;
            }
            new DemoLeftSideView({el: $('#leftContainer'), demoId: demoId});
        }
    });
    return DemoPageView;
});
