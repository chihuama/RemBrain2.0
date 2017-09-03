"use strict"

var App = App || {};

let bodyLoadPromise = new Promise(function(resolve, reject) {
  $(document).ready(function() {
    console.log("ready");
    resolve();
  });
});

Promise.all([bodyLoadPromise, less.pageLoadFinished]).then(function() {
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

  // initialize the attributes for computing PCA (all as default)
  App.pcaAttributes = {};
  for (let attr of App.sortingAttributes) {
    if (attr != "animal.id") {
      App.pcaAttributes[attr] = true;
    }
  }

  // color scale
  App.colorScale = ["#cccccc", "#1f78b4", "#ff7f00", "#33a02c", "#e31a1c",
    "#6a3d9a", "#a6cee3", "#fdbf6f", "#b2df8a", "#fb9a99", "#cab2d6"
  ];

  App.colorHighlight = {
    "Left": "#8c510a",
    "Right": "#01665e"
  }

  App.animationId = {
    "imageSliceLeft": null,
    "imageSliceRight": null
  };
  

  App.init = function() {
    // create models
    App.models.networkMetrics = new NetworkMetricsModel();
    App.models.networkDynamics = new NetworkDynamicsModel();
    App.models.applicationState = new ApplicationStateModel();

    // create views
    App.views.pca = new PcaView("#pca");
    App.views.kiviatSummary = new KiviatSummaryView("#kiviatSummary");
    App.views.imageSliceLeft = new ImageSliceView("#imageSliceLeft");
    App.views.imageSliceRight = new ImageSliceView("#imageSliceRight");
    App.views.controlLegend = new ControlLegendView();

    // create controllers
    App.controllers.kiviatSorting = new KiviatSortingController();
    App.controllers.pcaAttrSelector = new PcaAttrSelectorController();
    App.controllers.animalSelector = new AnimalSelectorController();
    App.controllers.activationSelector = new ActivationSelectorController();
    App.controllers.timeSliderLeft = new TimeSliderController("#timeSliderLeft");
    App.controllers.timeSliderRight = new TimeSliderController("#timeSliderRight");
    App.controllers.imageSlice = new ImageSliceController();


    // load network metrics from all runs
    App.models.networkMetrics.loadNetworkMetrics()
      .then(function(data) {
        console.log("Promise Finished", data);

        // controllers
        App.controllers.kiviatSorting.attachToSelect(".attribute-dropdown");

        // views
        App.views.kiviatSummary.create(data);
        App.views.pca.pcaPlot(data, "averagePCA");

      })
      .catch(function(err) {
        console.log("Promise Error", err);
      });
  };

  // global utility function
  App.activationPropertiesToVector = function(activation) {
    return _.map(
      // _.filter(Object.keys(activation), key => key !== 'size'),
      _.filter(Object.keys(activation), key => (key !== 'size' && App.pcaAttributes[key])),
      attr => activation[attr]
    );
  }

})();
