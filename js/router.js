define([
    'jquery',
    'underscore',
    'backbone',
    'views/HomePageView',
    'views/AboutPageView',
    'views/MenuView',
    'views/FooterView',
    'views/LicensePageView',
    'views/BlogPostsView',
    'views/SearchPageView',
    'views/demos/DemoIndexView',
    'views/demos/DemoPageView',
    'domReady!'
], function ($, _, Backbone, HomePageView, AboutPageView, MenuView, FooterView, LicensePageView, BlogPostsView, SearchPageView, DemoIndexView, DemoPageView) {
    var Router = Backbone.Router.extend({
        routes: {
            "demo/:demoId": "demo",
            "search/:keywords": "search",
            "*actions": "defaultRoute"
        }
    });

    var initialize = function () {
        var router = new Router(this);
        router.version = '12.15';
        router.menuView = new MenuView({el: $('#navContainer')});
        router.modules = {};
        router.modules.footer = new FooterView({el: $('#footer')});

        router.on('route:defaultRoute', function (actions) {
            $('.overlay').hide();
            $('#keywords').val('');
            var _this = this;
            switch (actions) {
                case 'about':
                {
                    if (typeof this.modules.about == 'undefined') {
                        this.modules.about = new AboutPageView({el: $('#content')});
                    }
                    this.modules.about.render();
                    this.menuView.changeMenu('about');
                    break;
                }
                case 'demos':
                {
                    if (typeof this.modules.demos == 'undefined') {
                        this.modules.demos = new DemoIndexView({el: $('#content')});
                    }
                    this.modules.demos.render();
                    this.menuView.changeMenu('demos');
                    break;
                }
                case 'blogs':
                {
                    if (typeof this.modules.blogPosts == 'undefined') {
                        this.modules.blogPosts = new BlogPostsView({el: $('#content')});
                        this.modules.blogPosts.fetchData();
                    } else {
                        this.modules.blogPosts.render();
                    }
                    this.menuView.changeMenu('blogs');
                    break;
                }
                case 'license':
                {
                    if (typeof this.modules.license == 'undefined') {
                        _this.modules.license = new LicensePageView({el: $('#content')});
                    }
                    _this.modules.license.render();
                    break;
                }
                default:
                {
                    if (typeof this.modules.home == 'undefined') {
                        this.modules.home = new HomePageView({el: $('#content')});
                    }
                    this.modules.home.render();
                    this.menuView.changeMenu('home');
                    break;
                }
            }
        });

        router.on('route:demo', function (actions) {
            $('.overlay').hide();
            $('#keywords').val('');
            if (this.modules.demo == null) {
                this.modules.demo = 'loading';
                this.modules.demo = new DemoPageView({el: $('#content'), router: router});
                this.modules.demo.loadData(actions);
            } else if (this.modules.demo != 'loading') {
                this.modules.demo.render(actions);
            }
            this.menuView.changeMenu('demos')
        });


        router.on('route:search', function (keywords) {
            $('.overlay').hide();
            $('#keywords').val(keywords.split('+').join(' '));
            if (this.modules.search == null) {
                this.modules.search = new SearchPageView({el: $('#content')});
            }
            this.modules.search.fetchData(keywords);
        });

        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});