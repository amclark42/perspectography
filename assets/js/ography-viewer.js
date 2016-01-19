//'use strict';

// Perspectography

cor.config = {
  XQUERY_ROOT : 'http://localhost:8080/exist/restxq/perspectography'
};

/*
 * MODELS
 */


/*
 * COLLECTIONS
 */

var Books = Backbone.Collection.extend({
  url: '/exist/restxq/books'
});

/*
 * VIEWS
 */


/*
 * ROUTERS
 */


/*
 * INITIALIZERS
 */

// When the HTML is loaded, start the application.
$(document).ready(function() {
  //cor.app = new cor.router.App();
  console.log("No problems here yet");
});