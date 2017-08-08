"use strict"

var App = App || {};

let AnimalSelectorController = function() {
  let self = {
    animalId: null,
    animalInd: null
  };

  function updateFromPCA(animalId) {
    self.animalId = animalId;
    self.animalInd = _.indexOf(Object.keys(App.runs).sort(), animalId);

    // update the application state
    App.models.applicationState.setSelectedAnimalId(self.animalId);

    updateViews();
  }

  function updateFromKiviat(Ind) {
    self.animalInd = Ind;
    self.animalId = Object.keys(App.runs).sort()[Ind];

    // update the application state
    App.models.applicationState.setSelectedAnimalId(self.animalId);

    updateViews();
  }

  function updateViews() {
    App.views.kiviatSummary.selectAnimal(self.animalInd);

    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") {
      // update the pca view by animal
      App.views.pca.selectAnimal(self.animalId);
    } else {
      // update the pca view by run
      let data = App.models.networkMetrics.getNetworkMetrics();
      App.views.pca.pcaPlot(data, pcaMode);
    }
  }

  return {
    updateFromPCA,
    updateFromKiviat
  };

}
