"use strict"

var App = App || {};

let AnimalSelectorController = function() {
  let self = {
    animalInd: null
  };

  function updateFromPCA(Ind) {
    self.animalInd = Ind;

    updateViews();
  }

  function updateViews() {

  }

  return {
    update
  };

}
