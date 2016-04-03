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
  url: og.config.XQUERY_ROOT
}); // og.Datasets

og.NamesList = Backbone.Collection.extend({
  model: og.NamePart
}); // og.NamesList

/*
 * VIEWS
 */

og.DatasetView = Backbone.View.extend({
  
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
    this.$el.prepend('<h2>Datasets</h2>')
    return this;
  }
}); // og.DatasetView

og.HomePage = Backbone.View.extend({
  
  className: 'home',
  
  initialize: function() {
    this.collection.fetch({reset: true});
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
    // TODO
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