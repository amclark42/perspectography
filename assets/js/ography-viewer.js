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
    name: '',
    url: ''
  },
  
  idAttribute: 'name'
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
  url: og.config.XQUERY_ROOT
}); // og.Datasets

og.NamesList = Backbone.Collection.extend({
  model: og.NamePart
}); // og.NamesList

/*
 * VIEWS
 */

og.HomePage = Backbone.View.extend({
  
  className: 'home',
  
  initialize: function() {
    this.collection.fetch({reset: true});
    this.listenTo(this.collection, 'reset', this.render);
  },
  
  render: function() {
    var panel = this.$el.empty();
    panel.prepend('<h2>Datasets</h2>');
    
		this.collection.each(function(model) {
			var item = new og.DatasetLink({model: model});
			panel.append(item.render().el);
		}, this);
		
		return this;
  }
});

og.DatasetLink = Backbone.View.extend({
  
  tagName: 'div',
  
  template: _.template(
    '<a href="#<%= name %>">'
    + '<svg width="100%" height="50">'
    + '<rect width="100%" height="100%"></rect>'
    + '<text x="50%" y="45%" alignment-baseline="middle" text-anchor="middle"><%= name %>'
    + '</text>'
    + '</svg>'
    + '</a>'),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}); // og.DatasetLink

og.DatasetHome = Backbone.View.extend({
  
  tagName: 'div',
  
  template: _.template(
    '<nav class="navbar navbar-default>'
    + '<div class="container-fluid>'
    + '<a href="#<%= name %>" class="navbar-brand"><%= name %></a>'
    + '</div>'
    + '<ul class="nav navbar-nav">'
    + '<li><a href="#<%= name %>/bibls">Bibls</a></li>'
    + '<li><a href="#<%= name %>/persons">Persons</a></li>'
    + '</ul>'
    + '</nav>'
  ),
  
  initialize: function() {
    this.render();
  },
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}); // og.DatasetHome

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
    ''                      : 'home',
    ':dataset'              : 'dataset',
    'persons/new'           : 'new-person'
  },

  initialize: function() {
    this.homePg = new og.HomePage ({collection : new og.Datasets()});
  },

  setHTML: function(el) {
    $('div#main').html(el);
  },

  home: function() {
    this.setHTML(this.homePg.el);
  },
  
  dataset: function(dataset) {
    console.log("Triggered dataset view for " + dataset);
    this.dataset = new og.DatasetHome({model: this.homePg.collection.get(dataset)});
    this.setHTML(this.dataset.el);
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