"use strict"

var App = App || {};

let ApplicationStateModel = function() {

  let self = {
    attributesForPCA: [],
    attributeForSorting: "Animal Name", // default by name
    selectedAnimal: null
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

  return {
    setAttributesForPCA,
    getAttributesForPCA,
    setAttributeForSorting,
    getAttributeForSorting,
    setSelectedAnimal,
    getSelectedAnimal
  };

}
