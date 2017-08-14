"use strict"

var App = App || {};

let ApplicationStateModel = function() {

  let self = {
    attributesForPCA: [],
    attributeForSorting: "animal.id", // default by name

    selectedAnimal: null,  // objec includes all runs
    selectedAnimalId: null,  // animal.id
    selectedActivationId: null,  // activation.id

    timeSliderMode: "timeDuration",
    timeStart: 20,
    timeSpan: 10
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

  function setSelectedActivationId(activationId) {
    self.selectedActivationId = activationId;
  }

  function getSelectedActivationId() {
    return self.selectedActivationId;
  }


  function setTimeSliderMode(mode) {
    self.timeSliderMode = mode;
  }

  function getTimeSliderMode() {
    return self.timeSliderMode;
  }

  function setTimeStart(timeStart) {
    self.timeStart = Math.round(timeStart);
  }

  function getTimeStart() {
    return self.timeStart;
  }

  function setTimeSpan(timeSpan) {
    self.timeSpan = Math.round(timeSpan);
  }

  function getTimeSpan() {
    return self.timeSpan;
  }


  return {
    setAttributesForPCA,
    getAttributesForPCA,
    setAttributeForSorting,
    getAttributeForSorting,
    setSelectedAnimal,
    getSelectedAnimal,
    setSelectedAnimalId,
    getSelectedAnimalId,
    setSelectedActivationId,
    getSelectedActivationId,
    setTimeSliderMode,
    getTimeSliderMode,
    setTimeStart,
    getTimeStart,
    setTimeSpan,
    getTimeSpan
  };

}
