define([
  'jquery',
  'underscore',
  'backbone',
  '../Router'
], function($, _, Backbone, Router){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    Router.initialize({mapWidth: 550, mapHeight: 450});
  };

  return {
    initialize: initialize
  };
});