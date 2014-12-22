define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/home/HomePageView',
    'views/about/AboutPageView',
    'views/demos/Demo1PageView',
    'views/demos/Demo2PageView',
    'views/demos/Demo3PageView',
    'views/demos/demo4/Demo4PageView'
], function ($, _, Backbone, MenuView, HomePageView, AboutPageView, Demo1PageView, Demo2PageView, Demo3PageView, Demo4PageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo1" : "demo1",
            "demo2" : "demo2",
            "demo3" : "demo3",
            "demo4" : "demo4",
            "about" : "about",
            "*actions": "home"
        }
    });

    var initialize = function (args) {
        var router = new Router;

        var menuView = new MenuView({el: $('#navContainer')});
        var contentWrapper = $('#content');
        var homePageView = new HomePageView({el: contentWrapper});
        var aboutPageView = new AboutPageView({el: contentWrapper});
        var demoArgs = {el: contentWrapper, mapWidth: args.mapWidth, mapHeight: args.mapHeight};
        var demo1PageView = new Demo1PageView(demoArgs);
        var demo2PageView = new Demo2PageView(demoArgs);
        var demo3PageView = new Demo3PageView(demoArgs);
        var demo4PageView = new Demo4PageView(demoArgs);
        router.on('route:home', function (actions) {
            homePageView.render();
            menuView.changeMenu('home')
        });
        router.on('route:demo1', function (actions) {
            demo1PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo2', function (actions) {
            demo2PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo3', function (actions) {
            demo3PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo4', function (actions) {
            demo4PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:about', function (actions) {
            aboutPageView.render();
            menuView.changeMenu('about')
        });
        Backbone.history.start();
      };
      return {
        initialize: initialize
      };
    });