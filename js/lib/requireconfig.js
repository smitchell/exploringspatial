var require = {
    baseUrl: "./js",
    paths: {
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        json2: 'lib/json2',
        leaflet: 'lib/leaflet',
        leaflet_google: 'lib/leaflet-google',
        leaflet_bing: 'lib/leaflet-bing',
        leaflet_osm: 'lib/leaflet-osm',
        bingmap: 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&amp;mkt=en-US'
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

