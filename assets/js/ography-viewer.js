//'use strict';

// Perspectography

(function() {
	window.og = {}; // the Perspectography namespace
})();

og.config = {
  XQUERY_ROOT : '/exist/restxq/perspectography'
};


/*
 * BACKBONE PROTOTYPE ADDITIONS
 */

/* If the view must include one or more subviews, this function will render
  a given subview, making its DOM element ("el") an element within the
  current view's DOM. */
Backbone.View.prototype.assign = function(view, selector) {
  view.setElement(this.$(selector)).render();
};


/* If the view has defined a function 'onClose', use that. Otherwise, remove
  the view. This allows views to close their children if they want. Solution
  taken from "Backbone Fundamentals":
  https://addyosmani.com/backbone-fundamentals/#disposing-view-hierarchies */
Backbone.View.prototype.close = function() {
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
    this.total_results;
  },
  
  parse: function(response) {
    this.total_results = response.total_results;
    var results = response.results;
    console.log("Loaded "+results.length+" of "+this.total_results+" bibls");
    return results;
  }
}); // og.Bibls


og.Persons = Backbone.Collection.extend({
  model: og.Person,
  
  url: function() {
    return og.config.XQUERY_ROOT + '/' + this.dataset.get('name') + '/persons';
  },
  
  initialize: function(opts) {
    this.dataset = opts.dataset;
    this.total_results;
    var test = this.fetch({merge: false, remove: false, reset: true});
    //console.log(test);
  },
  
  parse: function(response) {
    this.total_results = response.total_results;
    var results = response.results;
    console.log("Loaded "+results.length+" of "+this.total_results+" persons");
    return results;
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
}); // og.HomePage


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


og.DatasetCentral = Backbone.View.extend({
  
  tagName: 'div',
  
  template: _.template(
    '<div class="dataset-nav"></div>'
  + '<div class="dataset-viewer"></div>'
  ),
  
  initialize: function(opts) {
    this.nav = new og.DatasetNav({model : opts.model});
    this.viewer;
    if ( opts.viewer !== undefined ) {
      this.viewer = opts.viewer;
    }
    this.render();
  },
  
  onClose: function() {
    this.nav.close();
    if ( this.viewer !== undefined )
      this.viewer.close();
  },
  
  render: function() {
    this.$el.html(this.template());
    this.assign(this.nav, 'div.dataset-nav');
    if ( this.viewer !== undefined )
      this.assign(this.viewer, 'div.dataset-viewer');
    return this;
  },
  
  resetViewer: function() {
    if ( this.viewer !== undefined ) {
      this.viewer.close();
      this.viewer = undefined;
      this.render();
    }
    return this;
  },
  
  setViewer: function(newViewer) {
    this.viewer = newViewer;
    this.render();
    return this;
  }
}); //og.DatasetCentral


og.DatasetNav = Backbone.View.extend({
  
  tagName: 'div',
  className: 'dataset-nav',
  
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
    this.on('reset',this.render);
    this.render();
  },
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}); // og.DatasetNav


og.PersonsViewer = Backbone.View.extend({
  
  tagName: 'div',
  className: 'dataset-viewer',
  
  template: _.template(
    '<p>'
      +this.collection.total_results
    +'</p>'
    +'<div id="ography-view">'
    +'</div>'),
  
  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },
  
  render: function() {
    this.$el.html(this.template());
    console.log(this.collection.at(0));
    return this;
  }
}); // og.PersonsViewer


og.PersonEditor = Backbone.View.extend({
  
  id: 'editor',
  
  template: _.template(''),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}); // og.PersonEditor


og.FourOhFour = Backbone.View.extend({
  
  template: _.template(
    '<div class="jumbotron">'
    + '<h1>Sorry! This page doesn\'t exist.</h1>'
  + '</div>'),
  
  initialize: function() {
    this.render();
  },
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
}); // og.FourOhFour


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
      this.showView(this.datasetView.resetViewer());
    }
  },
  
  datasetBibls: function(dataset) {
    if ( this.datasets.length === 0 ) {
      this.listenToOnce(this.datasets,'reset', function() {
        this.datasetBibls(dataset);
      });
    } else {
      this.getDataset(dataset);
      var bibls = new og.FourOhFour();
      this.showView(this.datasetView.setViewer(bibls));
    }
  },
  
  datasetPersons: function(dataset) {
    if ( this.datasets.length === 0 ) {
      this.listenToOnce(this.datasets,'reset', function() {
        this.datasetPersons(dataset);
      });
    } else {
      this.getDataset(dataset);
      var persons = new og.Persons({dataset: this.datasetView.model});
      var persViewer = new og.PersonsViewer({collection: persons});
      this.showView(this.datasetView.setViewer(persViewer));
    }
  },
  
  getDataset: function(dataset) {
    if ( this.datasetView === undefined
        || dataset !== this.datasetView.model.get('name') ) {
      console.log("Triggered dataset view for " + dataset);
      var datasetModel = this.homePg.collection.get(dataset);
      this.datasetView = new og.DatasetCentral({model: datasetModel});
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