"use strict"

var App = App || {};

let ActivationSelectorController = function() {
  let self = {
    activation: {},
    animalId: null,
    activationId: null
  }

  function update(activationId) {
    // update applicationState
    App.models.applicationState.setSelectedActivationId(activationId);
  }

  function highlight(animalId, activationId) {

    self.activation["mouse"] = animalId;
    self.activation["activation"] = activationId;

    if (animalId === App.models.applicationState.getSelectedAnimalId()) {
      App.views.kiviatSummary.highlightKiviat("kiviatAll", activationId);
    } else if (!App.models.applicationState.getSelectedAnimalId()) {
      App.views.kiviatSummary.highlightKiviat("kiviatAvg", animalId);
    }

    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") {

    } else {
      App.views.pca.highlightActivationOf(self.activation);
    }
  }

  function reset() {
    // reset kiviat Summary View
    if (App.models.applicationState.getSelectedAnimalId()) {
      d3.select(".highlight-kiviatAll").remove();
    } else {
      d3.select(".highlight-kiviatAvg").remove();
    }
    // reset PCA View
    App.views.pca.resetHighlightActivationOf(self.activation);
  }

  return {
    update,
    highlight,
    reset
  };

}
