define([
    'jquery',
    'underscore',
    'backbone',
    'views/MenuView',
    'views/FooterView',
    'views/demos/DemoIndexView',
    'views/demos/DemoPageView',
    'domReady!'
], function ($, _, Backbone, MenuView, FooterView, DemoIndexView, DemoPageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo/:demoId": "demo",
            "*actions": "defaultRoute"
        }
    });

    var initialize = function () {
        var router = new Router(this);
        router.menuView = new MenuView({el: $('#navContainer')});
        router.modules = {};
        router.modules.footer = new FooterView({el: $('#footer')});

        router.on('route:defaultRoute', function (actions) {
            $('.overlay').hide();
            var _this = this;
            switch (actions) {
                case 'about':
                {
                    if (typeof this.modules.about == 'undefined') {
                        this.modules.about = 'loading';
                        try {
                            require(['views/about/AboutPageView'], function (AboutPageView) {
                                _this.modules.about = new AboutPageView({el: $('#content')});
                                _this.modules.about.render();
                                _this.menuView.changeMenu('about')
                            });
                        } catch (e) {
                            // clear the loading indicator
                            delete this.modules.about;
                            throw e;
                        }
                    } else if (this.modules.about != 'loading') {
                        this.modules.about.render();
                        this.menuView.changeMenu('about')
                    }
                    break;
                }
                case 'demos':
                {
                    if (typeof this.modules.demos == 'undefined') {
                        this.modules.demos = new DemoIndexView({el: $('#content')});
                        this.modules.demos.render();
                        this.menuView.changeMenu('demos')
                    } else if (this.modules.demos != 'loading') {
                        this.modules.demos.render();
                        this.menuView.changeMenu('demos')
                    }
                    break;
                }
                case 'license':
                {
                    if (typeof this.modules.license == 'undefined') {
                        this.modules.license = 'loading';
                        try {
                            require(['views/LicensePageView'], function (LicensePageView) {
                                _this.modules.license = new LicensePageView({el: $('#content')});
                                _this.modules.license.render();
                                _this.menuView.changeMenu('')
                            });
                        } catch (e) {
                            // clear the loading indicator
                            delete this.modules.license;
                            throw e;
                        }
                    } else if (this.modules.license != 'loading') {
                        this.modules.license.render();
                        this.menuView.changeMenu('')
                    }
                    break;
                }
                default:
                {
                    if (typeof this.modules.home == 'undefined') {
                        this.modules.home = 'loading';
                        try {
                            require(['views/home/HomePageView'], function (HomePageView) {
                                _this.modules.home = new HomePageView({el: $('#content')});
                                _this.modules.home.render();
                                _this.menuView.changeMenu('home');
                            });
                        } catch (e) {
                            // clear the loading indicator
                            delete this.modules.home;
                            throw e;
                        }
                    } else if (this.modules.home != 'loading') {
                        this.modules.home.render();
                        this.menuView.changeMenu('home');
                    }
                    break;
                }
            }
        });

        router.on('route:demo', function (actions) {
            $('.overlay').hide();
            if (this.modules.demo == null) {
                this.modules.demo = 'loading';
                this.modules.demo = new DemoPageView({el: $('#content'), router: router});
                this.modules.demo.loadData(actions);
                this.menuView.changeMenu('')
            } else if (this.modules.demo != 'loading') {
                this.modules.demo.render(actions);
                this.menuView.changeMenu('')
            }
        });

        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});