"use strict"

var App = App || {};

let ApplicationStateModel = function() {

  let self = {
    attributesForPCA: [],
    attributeForSorting: "animal.id", // default by name

    selectedAnimal: null, // objec includes all runs
    selectedAnimalId: null, // animal.id
    selectedActivationId: null, // activation.id

    overlayMode: "homeComm",
    timeSliderMode: "timeDuration",

    maxNodeDegree: {
      "imageSliceLeft": 0,
      "imageSliceRight": 0
    },
    timeStart: {
      "Left": 20,
      "Right": 20
    },
    timeSpan: {
      "Left": 10,
      "Right": 10
    },
    timeStep: {
      "Left": 50,
      "Right": 50
    }

    // timeStart: 20,
    // timeSpan: 10
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


  function setOverlayMode(mode) {
    self.overlayMode = mode;
  }

  function getOverlayMode() {
    return self.overlayMode;
  }

  function setTimeSliderMode(mode) {
    self.timeSliderMode = mode;
  }

  function getTimeSliderMode() {
    return self.timeSliderMode;
  }

  function setMaxNodeDegree(side, nodeDegree) {
    self.maxNodeDegree[side] = nodeDegree;
  }

  function getMaxNodeDegree() {
    if (self.maxNodeDegree["imageSliceLeft"] >= self.maxNodeDegree["imageSliceRight"]) {
      return self.maxNodeDegree["imageSliceLeft"];
    } else {
      return self.maxNodeDegree["imageSliceRight"];
    }
  }

  function setTimeStart(side, timeStart) {
    self.timeStart[side] = Math.round(timeStart);
  }

  function getTimeStart(side) {
    return self.timeStart[side];
  }

  function setTimeSpan(side, timeSpan) {
    self.timeSpan[side] = Math.round(timeSpan);
  }

  function getTimeSpan(side) {
    return self.timeSpan[side];
  }

  function setTimeStep(side, timeStep) {
    self.timeStep[side] = Math.round(timeStep);
  }

  function getTimeStep(side) {
    return self.timeStep[side];
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
    setOverlayMode,
    getOverlayMode,
    setTimeSliderMode,
    getTimeSliderMode,
    setMaxNodeDegree,
    getMaxNodeDegree,
    setTimeStart,
    getTimeStart,
    setTimeSpan,
    getTimeSpan,
    setTimeStep,
    getTimeStep
  };

}
