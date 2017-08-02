"use strict"

var App = App || {};

let ApplicationStateModel = function() {

  let self = {
    attributesForPCA: [],
    attributeForSorting: "animal.id", // default by name
    selectedAnimal: null,  // objec includes all runs
    selectedAnimalId: null
  };

  function setAttributesForPCA(attrs) {
    self.attributesForPCA = attrs;
  }

  function getAttributesForPCA() {
    return self.attributesForPCA;
  }

  function setAttributeForSorting(attr) {
    self.attributeForSorting = attr;
  }

  function getAttributeForSorting() {
    return self.attributeForSorting;
  }

  function setSelectedAnimal(animal) {
    self.selectedAnimal = animal;
  }

  function getSelectedAnimal() {
    return self.selectedAnimal;
  }

  function setSelectedAnimalId(animalId) {
    self.selectedAnimalId = animalId;
  }

  function getSelectedAnimalId() {
    return self.selectedAnimalId;
  }

  return {
    setAttributesForPCA,
    getAttributesForPCA,
    setAttributeForSorting,
    getAttributeForSorting,
    setSelectedAnimal,
    getSelectedAnimal,
    setSelectedAnimalId,
    getSelectedAnimalId
  };

}
