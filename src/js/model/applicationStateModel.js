"use strict"

var App = App || {};

let ApplicationStateModel = function() {

  let self = {
    attributesForPCA: [],
    attributeForSorting: "animal.id", // default by name

    selectedAnimal: null, // objec includes all runs
    selectedAnimalId: null, // animal.id
    selectedActivationId: null, // activation.id

    timeSync: true,
    timeSliderMode: "timeStep",
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
    },
    animationMode: {
      "play": false,
      "stop": false
    },

    zoomSync: true,
    zoomSize: 3,
    zoomCenter: 0,
    mosaicMatrixMode: {
      "Left": {
        "Up": false,
        "Bottom": false
      },
      "Right": {
        "Up": false,
        "Bottom": false
      }
    },

    overlayMode: "homeComm",
    maxNodeDegree: {
      "imageSliceLeft": 0,
      "imageSliceRight": 0
    },

    sliceSelected: {
      "Left": false,
      "Right": false
    }

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

  /**************************************************/

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

  /**************************************************/

  function setTimeSync(check) {
    self.timeSync = check;
  }

  function getTimeSync() {
    return self.timeSync;
  }

  function setTimeSliderMode(mode) {
    self.timeSliderMode = mode;
  }

  function getTimeSliderMode() {
    return self.timeSliderMode;
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

  function setAnimationMode(play, stop) {
    self.animationMode.play = play;
    self.animationMode.stop = stop;
  }

  function getAnimationMode() {
    return self.animationMode;
  }

  /**************************************************/

  function setZoomSync(check) {
    self.zoomSync = check;
  }

  function getZoomSync() {
    return self.zoomSync;
  }

  function setZoomSize(size) {
    self.zoomSize = size;
  }

  function getZoomSize() {
    return self.zoomSize;
  }

  function setZoomCenter(center) {
    self.zoomCenter = center;
  }

  function getZoomCenter() {
    return self.zoomCenter;
  }

  function setMosaicMatrixMode(side, direction, check) {
    self.mosaicMatrixMode[side][direction] = check;
  }

  function getMosaicMatrixMode(side, direction) {
    return self.mosaicMatrixMode[side][direction];
  }

  function resetMosaicMatrixMode(side) {
    self.mosaicMatrixMode[side].Up = false;
    self.mosaicMatrixMode[side].Bottom = false;

    d3.select("#" + side + "-Up").select("span").attr("class", "glyphicon glyphicon-eye-close");
    d3.select("#" + side + "-Bottom").select("span").attr("class", "glyphicon glyphicon-eye-close");
  }

  /**************************************************/

  function setOverlayMode(mode) {
    self.overlayMode = mode;
  }

  function getOverlayMode() {
    return self.overlayMode;
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


  function loadSliceSelected(side) {
    self.sliceSelected[side] = true;
  }

  function checkSliceSelected(side) {
    return self.sliceSelected[side];
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
    setTimeSync,
    getTimeSync,
    setTimeSliderMode,
    getTimeSliderMode,
    setTimeStart,
    getTimeStart,
    setTimeSpan,
    getTimeSpan,
    setTimeStep,
    getTimeStep,
    setAnimationMode,
    getAnimationMode,
    setZoomSync,
    getZoomSync,
    setZoomSize,
    getZoomSize,
    setZoomCenter,
    getZoomCenter,
    setMosaicMatrixMode,
    getMosaicMatrixMode,
    resetMosaicMatrixMode,
    setOverlayMode,
    getOverlayMode,
    setMaxNodeDegree,
    getMaxNodeDegree,
    loadSliceSelected,
    checkSliceSelected
  };

}
