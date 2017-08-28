"use strict"

var App = App || {};

let AnimalSelectorController = function() {
  let self = {
    animalId: null
  };

  function updateViews(animalId) {
    self.animalId = animalId;

    App.views.kiviatSummary.selectAnimal(self.animalId);

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
    update: updateViews
  };

}
