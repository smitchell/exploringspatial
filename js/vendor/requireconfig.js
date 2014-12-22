var require = {
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-2.1.1',
        underscore: 'vendor/underscore',
        backbone: 'vendor/backbone',
        json2: 'vendor/json2',
        leaflet: "vendor/leaflet",
        leaflet_google: "vendor/leaflet-google",
        leaflet_bing: "vendor/leaflet-bing",
        leaflet_osm: "vendor/leaflet-osm"
    },
    shim: {
        'underscore': {
            exports: '_'
        },

        'backbone': {
            deps: ['underscore', 'json2'],
            exports: 'Backbone'
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

        'leaflet_osm': {
            deps: ['leaflet']
        }
    }
}
