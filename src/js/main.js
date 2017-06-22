"use strict"

var App = App || {};

let bodyLoadPromise = new Promise(function(resolve, reject) {
  $(document).ready(function() {
    console.log("ready");
    resolve();
  });
});

Promise.all([bodyLoadPromise,less.pageLoadFinished]).then(function() {
    console.log("less.js Page Load Finished!");
    App.init();
  })
  .catch(function(err) {
    console.log(err);
  });


(function() {
  App.models = {};
  App.views = {};
  App.controllers = {};

  // hard code the folder name according to the activation runs
  App.runs = {
    "Old36": ["a1", "a2"],
    "Old37": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
    "Old38": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"],
    "Old41": ["a1", "a2", "a3"],
    "Old42": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
    "Young33": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14"],
    "Young34": ["a1", "a2", "a3", "a4", "a5", "a6"],
    "Young35": ["a1", "a2", "a4", "a6", "a7", "a8", "a9"],
    "Young39": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"],
    "Young40": ["a1", "a2", "a3", "a4"],
  }

  App.sortingAttributes = ["animal.id", "observed", "time.span", "switching",
    "absence", "visiting", "homing", "avg.group.size", "avg.comm.size", "avg.stay", "max.stay"
  ];

  App.init = function() {
    // create models
    App.models.averagePCA = null;
    App.models.singularPCA = null;

    App.models.pca = new PcaModel();
    App.models.networkMetrics = new NetworkMetricsModel();
    App.models.applicationState = new ApplicationStateModel();

    // create views
    App.views.pca = new PcaView("#pca");
    App.views.kiviatSummary = new KiviatSummaryView("#kiviatSummary");

    // create controllers
    App.controllers.kiviatSorting = new KiviatSortingController();
    App.controllers.kiviatSelector = new KiviatSelectorController();


    // load network metrics from all runs
    App.models.networkMetrics.loadNetworkMetrics()
      .then(function(data) {
        console.log("Promise Finished", data);

        App.controllers.kiviatSorting.attachToSelect(".attribute-dropdown");

        App.views.kiviatSummary.create(data);

        // get flattened arrays of activations as objects
        let avgActivations = _.map(Object.values(data), mouse => mouse.average);
        let allActivations = _.flatten(
          _.map(Object.values(data), mouse => Object.values(mouse.activations))
        );

        // convert these arrays of objects into vector form
        let avgActivationsMatrix = _.map(avgActivations, App.activationPropertiesToVector);
        let allActivationsMatrix = _.map(allActivations, App.activationPropertiesToVector);

        // create a projection based on each set of vectors
        App.models.averagePCA = new ProjectionModel(avgActivationsMatrix);
        App.models.allPCA = new ProjectionModel(allActivationsMatrix);

        // set a projecction mode for averate or all points
        
        let projectionMode = "averagePCA"; // or "allPCA"
        // let projectionMode = "allPCA"; // or "averagePCA"
        App.views.pca.pcaPlot(data, App.models[projectionMode].pcaProject);

      })
      .catch(function(err) {
        console.log("Promise Error", err);
      });
  };

  // global utility function
  App.activationPropertiesToVector = function(activation) {
    return _.map(
      _.filter(Object.keys(activation), key => key !== 'size'),
      attr => activation[attr]
    );
  }

})();
