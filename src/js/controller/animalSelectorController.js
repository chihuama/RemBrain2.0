"use strict"

var App = App || {};

let AnimalSelectorController = function() {
  let self = {
    animalId: null
  };

  function updateViews(animalId) {
    self.animalId = animalId;

    if (self.animalId === App.models.applicationState.getSelectedAnimalId()) {
      App.models.applicationState.setSelectedAnimalId(null);
    } else {
      App.models.applicationState.setSelectedAnimalId(self.animalId);
    }
    console.log(App.models.applicationState.getSelectedAnimalId());

    App.views.kiviatSummary.selectAnimal(self.animalId);

    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") {
      // update the pca view by animal
      App.views.pca.selectAnimal(self.animalId);
    } else {
      // update the pca view by run
      if (App.models.applicationState.getSelectedAnimalId()) {
        App.views.pca.highlightAnimalOf(self.animalId);
      } else {
        App.views.pca.resetHighlightAnimal();
      }
    }
  }

  return {
    update: updateViews
  };

}
