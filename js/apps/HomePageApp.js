/**
 * The home page application bootstraps the single page web site exploringspatial.com
 * by initialing the Backbone router for the site.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  '../Router'
], function($, _, Backbone, Router){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    Router.initialize({mapWidth: '100%', mapHeight: 450});
  };

  return {
    initialize: initialize
  };
});