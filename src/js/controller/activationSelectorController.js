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

    // highlight kiviat diagram
    if (animalId === App.models.applicationState.getSelectedAnimalId()) {
      App.views.kiviatSummary.highlightKiviat("kiviatAll", activationId);
    } else if (!App.models.applicationState.getSelectedAnimalId()) {
      App.views.kiviatSummary.highlightKiviat("kiviatAvg", animalId);
    }

    // highlight pca dot
    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") {
      d3.select("#singleActivation-" + activationId)
        .attr("r", 3)
        .style("stroke", "gray")
        .style("stroke-width", 1);
    } else {
      App.views.pca.highlightActivationOf(self.activation);
    }
  }

  function reset(activationId) {
    // reset kiviat Summary View
    if (App.models.applicationState.getSelectedAnimalId()) {
      d3.select(".highlight-kiviatAll").remove();
    } else {
      d3.select(".highlight-kiviatAvg").remove();
    }

    // reset PCA View
    let pcaMode = App.controllers.pcaAttrSelector.getMode();
    if (pcaMode === "averagePCA") {
      d3.select("#singleActivation-" + activationId)
        .attr("r", 2)
        .style("stroke", "none");
    } else {
      App.views.pca.resetHighlightActivationOf(self.activation);
    }

  }

  return {
    update,
    highlight,
    reset
  };

}
