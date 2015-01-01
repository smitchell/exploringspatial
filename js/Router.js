define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView',
    'views/home/HomePageView',
    'views/about/AboutPageView',
    'views/LicensePageView',
    'views/demos/Demo1PageView',
    'views/demos/Demo2PageView',
    'views/demos/Demo3PageView',
    'views/demos/Demo4PageView'
], function ($, _, Backbone, MenuView, FooterView, HomePageView, AboutPageView, LicensePageView, Demo1PageView, Demo2PageView, Demo3PageView, Demo4PageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo1" : "demo1",
            "demo2" : "demo2",
            "demo3" : "demo3",
            "demo4" : "demo4",
            "about" : "about",
            "license" : "license",
            "*actions": "home"
        }
    });

    var initialize = function (args) {
        var router = new Router;

        var menuView = new MenuView({el: $('#navContainer')});
        new FooterView({el: $('#footer')});
        var contentWrapper = $('#content');
        var homePageView = null;
        var aboutPageView = null;
        var licensePageView  = null;
        var demoArgs = {el: contentWrapper, mapWidth: args.mapWidth, mapHeight: args.mapHeight};
        var demo1PageView = null;
        var demo2PageView = null;
        var demo3PageView = null;
        var demo4PageView = null;
        router.on('route:home', function (actions) {
            if (homePageView == null) {
                homePageView = new HomePageView({el: contentWrapper});
            }
            homePageView.render();
            menuView.changeMenu('home')
        });
        router.on('route:demo1', function (actions) {
            if (demo1PageView == null) {
                demo1PageView = new Demo1PageView(demoArgs);
            }
            demo1PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo2', function (actions) {
            if (demo2PageView == null) {
                demo2PageView = new Demo2PageView(demoArgs);
            }
            demo2PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo3', function (actions) {
            if (demo3PageView == null) {
                demo3PageView = new Demo3PageView(demoArgs);
            }
            demo3PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo4', function (actions) {
            if (demo4PageView == null) {
                demo4PageView = new Demo4PageView(demoArgs);
            }
            demo4PageView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:about', function (actions) {
            if (aboutPageView == null) {
                aboutPageView = new AboutPageView({el: contentWrapper});
            }
            aboutPageView.render();
            menuView.changeMenu('about')
        });
        router.on('route:license', function (actions) {
            if (licensePageView == null) {
                licensePageView = new LicensePageView({el: contentWrapper});
            }
            licensePageView.render();
        });
        Backbone.history.start();
      };
      return {
        initialize: initialize
      };
    });