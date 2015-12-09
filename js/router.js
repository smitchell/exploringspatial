define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView'
], function ($, _, Backbone, MenuView, FooterView) {
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
        var _this = this;
        _this.menuView = new MenuView({el: $('#navContainer')});
        new FooterView({el: $('#footer')});
        var contentWrapper = $('#content');
        this.homePageView = null;
        this.aboutPageView = null;
        this.licenseView = null;
        this.demoPageView = null;
        this.demoIndexView = null;

        router.on('route:home', function () {
            $('.overlay').hide();
            if (_this.homePageView == null) {
                require(['views/home/HomePageView'], function (HomePageView) {
                    _this.homePageView = new HomePageView({el: contentWrapper});
                    _this.homePageView.render();
                    _this.menuView.changeMenu('home');
                });
            } else {
                _this.homePageView.render();
                _this.menuView.changeMenu('home');
            }
        });

        router.on('route:demos', function () {
            $('.overlay').hide();
            if (_this.demoIndexView == null) {
                require(['views/demos/DemoIndexView'], function (DemoIndexView) {
                    _this.demoIndexView = new DemoIndexView({el: contentWrapper});
                    _this.demoIndexView.render();
                    _this.menuView.changeMenu('demos')
                });
            } else {
                _this.demoIndexView.render();
                _this.menuView.changeMenu('demos')
            }
        });

        router.on('route:demo', function (demoId) {
            $('.overlay').hide();
            var numericId = Number(demoId);
            if (isNaN(numericId)) {
                throw new Error('DemoId must be numeric.');
            }
            if (_this.demoPageView == null) {
                require(['views/demos/DemoPageView'], function (DemoPageView) {
                    _this.demoPageView = new DemoPageView({el: contentWrapper, demoId: numericId, router: router});
                    _this.demoPageView.render(numericId);
                    _this.menuView.changeMenu('')
                });
            } else {
                _this.demoPageView.render(numericId);
                _this.menuView.changeMenu('')
            }
        });

        router.on('route:about', function () {
            $('.overlay').hide();
            if (_this.aboutPageView == null) {
                require(['views/about/AboutPageView'], function (AboutPageView) {
                    _this.aboutPageView = new AboutPageView({el: contentWrapper});
                    _this.aboutPageView.render();
                    _this.menuView.changeMenu('about')
                });
            } else {
                _this.aboutPageView.render();
                _this.menuView.changeMenu('about')
            }
        });

        router.on('route:license', function () {
            $('.overlay').hide();
            if (_this.licenseView == null) {
                require(['views/LicenseView'], function (LicenseView) {
                    _this.licenseView = new LicenseView({el: contentWrapper});
                    _this.licenseView.render();
                });
            } else {
                _this.licenseView.render();
            }
            _this.menuView.changeMenu('')
        });

        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});