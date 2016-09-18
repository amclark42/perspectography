//'use strict';

// Perspectography

(function() {
	window.og = {}; // the WWP Cultures of Reception namespace
})();

og.config = {
  XQUERY_ROOT : 'http://localhost:8080/exist/restxq/perspectography'
};


/*
 * BACKBONE PROTOTYPE ADDITIONS
 */

Backbone.View.prototype.close = function() {
  /* If the view has defined a function 'onClose', use that. Otherwise, remove
    the view. This allows views to close their children if they want. Solution
    taken from "Backbone Fundamentals":
    https://addyosmani.com/backbone-fundamentals/#disposing-view-hierarchies */
  if ( this.onClose ) {
    this.onClose();
  }
  this.remove();
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

/*og.PersNamePart = Backbone.Model.extend({
  
  defaults: {
    part: null,
    type: null
  }
});*/

og.Bibl = Backbone.Model.extend({
  idAttribute: "id"
  
}); // og.Person

og.Person = Backbone.Model.extend({
  idAttribute: "id",
  
  /*parse: function(response) {
    if ( response.persNames ) {
      this.names = new og.Names(response.persNames);
    }
    
    delete response.persNames;
    return response;
  }*/
}); // og.Person


/*
 * COLLECTIONS
 */

og.Datasets = Backbone.Collection.extend({
  model: og.Dataset,
  url: og.config.XQUERY_ROOT
}); // og.Datasets

og.Bibls = Backbone.Collection.extend({
  model: og.Bibl,
  
  url: function() {
    return og.config.XQUERY_ROOT + '/' + this.dataset.get('name') + '/bibls';
  },
  
  initialize: function(opts) {
    this.dataset = opts.dataset;
  }
}); // og.Bibls

og.Persons = Backbone.Collection.extend({
  model: og.Person,
  
  url: function() {
    return og.config.XQUERY_ROOT + '/' + this.dataset.get('name') + '/persons';
  },
  
  initialize: function(opts) {
    this.dataset = opts.dataset;
  }
}); // og.Persons

/*og.NamesList = Backbone.Collection.extend({
  model: og.NamePart
});*/ // og.NamesList


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
  + '</nav>'),
  
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

og.FourOhFour = Backbone.View.extend({
  
  template: _.template(
    '<div class="jumbotron">'
    + '<h1>Sorry! This page doesn\'t exist yet.</h1>'
  + '</div>'),
  
  initialize: function() {
    this.render();
  },
  
  render: function() {
    this.$el.html(this.template());
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
    ':dataset/bibls'        : 'datasetBibls',
    ':dataset/persons'      : 'datasetPersons',
    //'persons/new'           : 'newPerson',
    '*default'              : 'noPageMatch'
  },

  initialize: function() {
    this.datasets = new og.Datasets();
    this.homePg = new og.HomePage ({collection : this.datasets});
  },
  
  // Function to close dangling views.
  closeViews: function() {
    if ( this.currentView ) {
      this.currentView.close();
    }
  },
  
  // Function for use with dynamic pages. Closes existing views and places the
    // current one in $('div#main').
  showView: function(view) {
    this.closeViews();
    this.currentView = view;
    this.currentView.render();
    $('div#main').html(this.currentView.el);
    $('div#main').fadeIn();
  },

  home: function() {
    this.showView(this.homePg);
  },
  
  dataset: function(dataset) {
    if ( this.datasets.length === 0 ) {
      this.listenToOnce(this.datasets,'reset', function() {
        this.dataset(dataset);
      });
    } else {
      this.getDataset(dataset);
      this.showView(this.datasetView);
    }
  },
  
  datasetBibls: function(dataset) {
    if ( this.datasets.length === 0 ) {
      this.listenToOnce(this.datasets,'reset', function() {
        this.dataset(dataset);
      });
    } else {
      this.getDataset(dataset);
    }
  },
  
  datasetPersons: function(dataset) {
    if ( this.datasets.length === 0 ) {
      this.listenToOnce(this.datasets,'reset', function() {
        this.dataset(dataset);
      });
    } else {
      this.getDataset(dataset);
    }
  },
  
  getDataset: function(dataset) {
    if ( this.datasetView === undefined || dataset !== this.datasetView.model.get('name') ) {
      console.log("Triggered dataset view for " + dataset);
      var datasetModel = this.homePg.collection.get(dataset);
      this.datasetView = new og.DatasetHome({model: datasetModel});
    }
    return this.datasetView;
  },
  
  noPageMatch: function() {
    this.showView(new og.FourOhFour({}));
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