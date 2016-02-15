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

og.Dataset = Backbone.Model.extend({
  
  defaults: {
    name: null,
    url: null
  }
});

og.PersNamePart = Backbone.Model.extend({
  
  defaults: {
    part: null,
    type: null
  }
});

og.Person = Backbone.Model.extend({
  idAttribute: "id",
  
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

og.Datasets = Backbone.Collection.extend({
  model: og.Dataset,
  url: og.config.XQUERY_ROOT,
  
  update: function() {
    var that = this;
    
    $.get(that.url,
      function(response) {
        that.reset(response);
    });
  }
}); // og.Datasets

og.NamesList = Backbone.Collection.extend({
  model: og.NamePart
}); // og.NamesList

/*
 * VIEWS
 */

og.DatasetView = Backbone.View.extend({
  
  tagName: 'li',
  
  template: _.template(
    '<a href="#">'
    + '<svg width="600" height="200">'
    + '<rect width="600" height="200"></rect>'
    + '<text x="50%" y="45%" alignment-baseline="middle" text-anchor="middle">'
    + '<%= name %>'
    + '</text>'
    + '</svg>'
    + '</a>'
  ),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}); // og.DatasetView

og.HomePage = Backbone.View.extend({
  
  className: 'home',
  
  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },
  
  render: function() {
    var panel = this.$el.empty();
    
		this.collection.each(function(model) {
			var item = new og.DatasetView({model: model});
			panel.append(item.render().el);
		}, this);
		
		return this;
  }
});

og.PersonEditor = Backbone.View.extend({
  
  id: 'editor',
  
  template: _.template(''),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
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
    this.home = new og.HomePage ({collection : new og.Datasets()});
    this.home.collection.update();
  },

  setHTML: function(el) {
    $('div#main').html(el);
  },

  main: function() {
    this.home.render();
    this.setHTML(this.home.el);
    console.log(this.home.el);
  }
}); //og.Router

/*
 * INITIALIZERS
 */

// When the HTML is loaded, start the application.
$(document).ready(function() {
  og.app = new og.Router();
	Backbone.history.start(/*{pushState: true}*/);
});