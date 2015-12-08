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
], function ($, _, Backbone, MenuView, FooterView, HomePageView, AboutPageView, LicensePageView, DemoIndexView, DemoPageView) {
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
            $('.overlay').hide();
            if (homePageView == null) {
                homePageView = new HomePageView({el: contentWrapper});
            }
            homePageView.render();
            menuView.changeMenu('home')
        });
        router.on('route:demos', function (actions) {
            $('.overlay').hide();
            if (demoIndexView == null) {
                demoIndexView = new DemoIndexView({el: contentWrapper});
            }
            demoIndexView.render();
            menuView.changeMenu('demos')
        });
        router.on('route:demo', function (demoId) {
            var numericId = Number(demoId);
            if (isNaN(numericId)) {
                throw new Error('DemoId must be numeric.');
            }
            if (demoPageView == null) {
                demoPageView = new DemoPageView({el: contentWrapper, demoId: numericId, router: router});
            } else {
                demoPageView.render(numericId);
            }
            menuView.changeMenu('')
        });
        router.on('route:about', function (actions) {
            $('.overlay').hide();
            if (aboutPageView == null) {
                aboutPageView = new AboutPageView({el: contentWrapper});
            }
            aboutPageView.render();
            menuView.changeMenu('about')
        });
        router.on('route:license', function (actions) {
            $('.overlay').hide();
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