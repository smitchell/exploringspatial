/**
 * The home page application bootstraps the single page web site exploringspatial.byteworksinc.com
 * by initialing the Backbone router for the site.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'router'
], function($, _, Backbone, Router){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    Router.initialize();
  };

  return {
    initialize: initialize
  };
});
