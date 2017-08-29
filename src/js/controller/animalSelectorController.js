"use strict"

var App = App || {};

let AnimalSelectorController = function() {
  let self = {
    animalId: null
  };

  function update(animalId) {
    self.animalId = animalId;

    // update the application state
    if (self.animalId === App.models.applicationState.getSelectedAnimalId()) {
      App.models.applicationState.setSelectedAnimalId(null);
    } else {
      App.models.applicationState.setSelectedAnimalId(self.animalId);
    }

    // update kiviat summary view
    App.views.kiviatSummary.selectAnimal(self.animalId);

    // update pca views
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

  function highlight(animalId) {
    // highlight kiviat diagram
    App.views.kiviatSummary.highlightKiviat("kiviatAvg", animalId);

    let selectedAnimalId = App.models.applicationState.getSelectedAnimalId();

    // highlight pca dots
    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") { // by animal
      d3.select("#" + animalId)
        .style("stroke", "gray")
        .style("stroke-width", 1);
    } else { // by run
      App.views.pca.highlightAnimalOf(animalId);
    }
  }

  function reset(animalId) {
    d3.select(".highlight-kiviatAvg").remove();

    _.forEach(Object.keys(App.runs), function(value) {
      d3.select("#" + value).style("stroke", "none");
    });

    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    let selectedAnimalId = App.models.applicationState.getSelectedAnimalId();

    if (pcaMode === "averagePCA") { // by animal
      d3.select("#" + selectedAnimalId)
        .style("stroke", "gray")
        .style("stroke-width", 1);
    } else {
      if (selectedAnimalId) {
        App.views.pca.highlightAnimalOf(selectedAnimalId);
      } else {
        App.views.pca.resetHighlightAnimal();
      }
    }

  }

  return {
    update,
    highlight,
    reset
  };

}
