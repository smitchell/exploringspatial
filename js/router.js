define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView',
    'views/home/HomePageView',
    'views/ActivityPageView',
    'views/about/AboutPageView',
    'views/LicensePageView',
    'views/demos/DemoPageView'
], function ($, _, Backbone, MenuView, FooterView, HomePageView, ActivityPageView, AboutPageView, LicensePageView, DemoPageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo/:demoId" : "demo",
            "activity/:activityId" : "activity",
            "about" : "about",
            "license" : "license",
            "*actions": "home"
        }
    });

    var initialize = function (args) {
        var router = new Router(this);

        var menuView = new MenuView({el: $('#navContainer')});
        new FooterView({el: $('#footer')});
        var contentWrapper = $('#content');
        var homePageView = null;
        var activityPageView = null;
        var aboutPageView = null;
        var licensePageView  = null;
        var demoArgs = {el: contentWrapper, mapWidth: args.mapWidth, mapHeight: args.mapHeight};
        var demoPageView = null;
        router.on('route:home', function (actions) {
            if (homePageView == null) {
                homePageView = new HomePageView({el: contentWrapper});
            }
            homePageView.render();
            menuView.changeMenu('home')
        });
        router.on('route:activity', function (activityId) {
            if (activityPageView == null) {
                activityPageView = new ActivityPageView(demoArgs);
            }
            activityPageView.render(activityId);
            menuView.changeMenu('demos')
        });
        router.on('route:demo', function (demoId) {
            if (demoPageView == null) {
                demoPageView = new DemoPageView(demoArgs, demoId);
            }
            demoPageView.render(demoId);
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