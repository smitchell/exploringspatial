define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView',
    'views/LicensePageView'
], function ($, _, Backbone, MenuView, FooterView, LicensePageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo/:demoId": "demo",
            "demos": "demos",
            "about": "about",
            "license": "license",
            "*actions": "home"
        }
    });

    var initialize = function () {
        var router = new Router(this);
        var menuView = new MenuView({el: $('#navContainer')});
        new FooterView({el: $('#footer')});
        var contentWrapper = $('#content');
        var homePageView = null;
        var aboutPageView = null;
        var licensePageView = null;
        var demoPageView = null;
        var demoIndexView = null;
        $('.overlay').hide();

        router.on('route:home', function () {
            if (homePageView == null) {
                require(['views/home/HomePageView'], function (HomePageView) {
                    homePageView = new HomePageView({el: contentWrapper});
                    homePageView.render();
                    menuView.changeMenu('home');
                });
            } else {
                homePageView.render();
                menuView.changeMenu('home');
            }
        });

        router.on('route:demos', function () {
            if (demoIndexView == null) {
                require(['views/demos/DemoIndexView'], function (DemoIndexView) {
                    demoIndexView = new DemoIndexView({el: contentWrapper});
                    demoIndexView.render();
                    menuView.changeMenu('demos')
                });
            } else {
                demoIndexView.render();
                menuView.changeMenu('demos')
            }
        });

        router.on('route:demo', function (demoId) {
            var numericId = Number(demoId);
            if (isNaN(numericId)) {
                throw new Error('DemoId must be numeric.');
            }
            if (demoPageView == null) {
                require(['views/demos/DemoPageView'], function (DemoPageView) {
                    demoPageView = new DemoPageView({el: contentWrapper, demoId: numericId, router: router});
                    demoPageView.render(numericId);
                    menuView.changeMenu('')
                });
            } else {
                demoPageView.render(numericId);
                menuView.changeMenu('')
            }
        });

        router.on('route:about', function () {
            if (aboutPageView == null) {
                require(['views/about/AboutPageView'], function (AboutPageView) {
                    aboutPageView = new AboutPageView({el: contentWrapper});
                    aboutPageView.render();
                    menuView.changeMenu('about')
                });
            } else {
                aboutPageView.render();
                menuView.changeMenu('about')
            }
        });

        router.on('route:license', function () {
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