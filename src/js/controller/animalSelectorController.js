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

    updateViews();
  }

  function updateFromKiviat(Ind) {
    self.animalInd = Ind
    self.animalId = Object.keys(App.runs).sort()[Ind];

    updateViews();
  }

  function updateViews() {
    App.views.pca.selectAnimal(self.animalId);
    App.views.kiviatSummary.selectAnimal(self.animalInd);
  }

  return {
    updateFromPCA,
    updateFromKiviat
  };

}
