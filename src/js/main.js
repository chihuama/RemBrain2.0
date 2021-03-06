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

  // initialize the attributes for computing PCA (all as default)
  App.pcaAttributes = {};
  for (let attr of App.sortingAttributes) {
    if (attr != "animal.id") {
      App.pcaAttributes[attr] = true;
    }
  }

  // color scale
  App.colorScale = ["#cccccc", "#1f78b4", "#ff7f00", "#33a02c", "#e31a1c",
    "#6a3d9a", "#a6cee3", "#fdbf6f", "#b2df8a", "#fb9a99", "#cab2d6"];
  // App.colorScale = ["#cccccc", "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395"];

  App.colorHighlight = {
    "Left": "#8c510a",
    "Right": "#01665e",
    "Up": "#b2182b",
    "Bottom": "#2166ac"
  };

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
    App.views.mosaicMatrixLeft = new MosaicMatrixView("#mosaicMatrixLeft");
    App.views.mosaicMatrixRight = new MosaicMatrixView("#mosaicMatrixRight");

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
