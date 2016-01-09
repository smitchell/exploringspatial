var require = {
    baseUrl: 'js/lib',
    paths: {
        jquery: 'jquery-2.1.4.min',
        jquery_ui: 'jquery-ui.min',
        domReady: 'domReady',
        underscore: 'underscore-min',
        backbone: 'backbone-min',
        highcharts: 'highcharts',
        router: '../router',
        leaflet: 'leaflet/beta/leaflet-1.0.0-b1',
        //leaflet: 'leaflet/leaflet-src',
        json2: 'json2.min',
        leaflet_google: 'leaflet/plugins/patel_shramov/tile/Google',
        //leaflet_bing: 'leaflet/plugins/patel_shramov/tile/Bing',
        leaflet_prunecluster: 'leaflet/plugins/PruneCluster/PruneCluster',
        leaflet_pip: 'leaflet/plugins/leaflet-pip',
        leaflet_hotline: 'leaflet/plugins/leaflet.hotline',
        leaflet_mapquest: 'http://www.mapquestapi.com/sdk/leaflet/v2.s/mq-map.js?key=E1aPfpcd72j9wfglxliaYXnCeKO4pFD1',
        apps: '../apps',
        collections: '../collections',
        models: '../models',
        templates: '../templates',
        views: '../views',
        demos: '../demos',
        utils: '../utils'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'json2'],
            exports: 'Backbone'
        },
        'highcharts': {
            exports: 'Highcharts'
        },
        'jquery': {
            exports: '$'
        },
        'jquery_ui': {
            deps: ['jquery']
        },
        'leaflet': {
            exports: 'L'
        },
        'leaflet_google': {
            deps: ['leaflet']
        },
        'leaflet_mapquest': {
            deps: ['leaflet'],
            exports: 'MQ'
        },
        //'leaflet_bing': {
        //    deps: ['leaflet']
        //},
        'leaflet_prunecluster': {
            deps: ['leaflet']
        },
        'leaflet_pip': {
            deps: ['leaflet'],
            exports: 'leafletPip'
        },
        'leaflet_hotline': {
            deps: ['leaflet']
        }
    }
};
