//'use strict';

// Perspectography

(function() {
	window.og = {}; // the WWP Cultures of Reception namespace
})();

og.config = {
  XQUERY_ROOT : 'http://localhost:8080/exist/restxq/perspectography'
};

/*
 * MODELS
 */

og.PersNamePart = Backbone.Model.extend({
  
  defaults: {
    part: null,
    type: null
  }
})

og.Person = Backbone.Model.extend({
  idAttribute: "xmlid",
  
  parse: function(response) {
    if ( response.persNames ) {
      this.names = new og.Names(response.persNames);
    }
    
    delete response.persNames;
    return response;
  }
}); // og.Person

/*
 * COLLECTIONS
 */

og.NamesList = Backbone.Collection.extend({
  model: og.NamePart
}); // og.NamesList

/*
 * VIEWS
 */

og.EditPerson = Backbone.View.extend({
  
});

/*
 * ROUTERS
 */

og.Router = Backbone.Router.extend({

  routes: {
    ''                      : 'main',
    'persons/new'           : 'new-person'
  },

  initialize: function() {
    this.groups = new cor.ListAuthorSet ({collection : new cor.ReceivedAuthorSet()});
    this.groups.collection.update();
    this.groups.render();
  },

  setHTML: function(el) {
    $('div#reception').html(el);
  },

  main: function() {
    this.setHTML(this.groups.el);
  }
}); //og.Router

/*
 * INITIALIZERS
 */

// When the HTML is loaded, start the application.
$(document).ready(function() {
  //og.app = new og.router.App();
  console.log("No problems here yet");
});