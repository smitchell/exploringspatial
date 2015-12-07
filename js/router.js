define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView',
    'views/home/HomePageView',
    'views/about/AboutPageView',
    'views/LicensePageView',
    'views/demos/DemoIndexView',
    'views/demos/DemoPageView'
], function ($, _, Backbone, MenuView, FooterView, HomePageView, AboutPageView, LicensePageView, DemoIndexView, DemoPageView, StyleManager) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo/:demoId" : "demo",
            "demos" : "demos",
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
        var aboutPageView = null;
        var licensePageView  = null;
        var demoPageView = null;
        var demoIndexView = null;
        router.on('route:home', function (actions) {
            if (homePageView == null) {
                homePageView = new HomePageView({el: contentWrapper});
            }
            homePageView.render();
            menuView.changeMenu('home')
        });
        router.on('route:demos', function (actions) {
            if (demoIndexView == null) {
                demoIndexView = new DemoIndexView({el: contentWrapper});
            }
            demoIndexView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo', function (demoId) {
            if (demoPageView == null) {
                demoPageView = new DemoPageView({el: contentWrapper, demoId: demoId, router: router});
            } else {
                demoPageView.render({demoId: demoId});
            }
            menuView.changeMenu('')
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