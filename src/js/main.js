"use strict"

var App = App || {};

less.pageLoadFinished
  .then(function() {
    console.log("less.js Page Load Finished!");
    App.init();
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

  App.sortingAttributes = ["Animal Name", "observed"];

  App.init = function() {
    // create models
    App.models.networkMetrics = new NetworkMetricsModel();
    App.models.applicationState = new ApplicationStateModel();

    // create views
    App.views.kiviatSummary = new KiviatSummaryView("#kiviatSummary");

    // create controllers
    App.controllers.kiviatSorting = new KiviatSortingController();

    // load network metrics from all runs
    App.models.networkMetrics.loadNetworkMetrics()
      .then(function(data) {
        console.log("Promise Finished", data);

        App.controllers.kiviatSorting.attachToSelect(".attribute-dropdown");

        App.views.kiviatSummary.update(data);
      })
      .catch(function(err) {
        console.log("Promise Error", err);
      });
  };

})();
