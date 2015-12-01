var require = {
    baseUrl: 'js/lib',
    paths: {
        jquery: 'jquery',
        underscore: 'underscore',
        backbone: 'backbone',
        router: '../router',
        leaflet: 'leaflet/leaflet-src',
        leaflet_label: 'leaflet/plugins/leaflet.label',
        json2: 'json2',
        leaflet_google: 'leaflet/plugins/patel_shramov/tile/Google',
        leaflet_bing: 'leaflet/plugins/patel_shramov/tile/Bing',
        leaflet_markercluster: 'leaflet/plugins/MarkerCluster/leaflet.markercluster-src',
        leaflet_prunecluster: 'leaflet/plugins/PruneCluster/PruneCluster',
        leaflet_pip: 'leaflet/plugins/leaflet-pip',
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
        'jquery': {
            exports: '$'
        },
        'leaflet': {
            exports: 'L'
        },
        'leaflet_google': {
            deps: ['leaflet']
        },
        'leaflet_bing': {
            deps: ['leaflet']
        },
        'leaflet_markercluster': {
            deps: ['leaflet']
        },
        'leaflet_prunecluster': {
            deps: ['leaflet']
        }
    }
};
