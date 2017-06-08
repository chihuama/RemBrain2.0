"use strict"

var App = App || {};

let KiviatSelectorController = function() {

  let self = {
    currentAnimal: null
  };

  function update(animalInd) {
    let animal = Object.keys(App.runs).sort()[animalInd];

    // get networkMetrics
    let networkMetrics = App.models.networkMetrics.getNetworkMetrics();
    // get currentAnimal
    self.currentAnimal = networkMetrics[animal];

    // update the kiviat summary view
    App.views.kiviatSummary.updateAnimal(self.currentAnimal);
  }

  return {
    update
  };

}
