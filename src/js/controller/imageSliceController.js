"use strict"

var App = App || {};

let ImageSliceController = function() {
  let self = {
    sliceSelected: {
      "imageSliceLeft": false,
      "imageSliceRight": false
    }
  };

  function load(side) {
    self.sliceSelected[side] = true;
  }

  function timeOpt(value) {
    console.log(value);
    App.models.applicationState.setTimeSliderMode(value);

    App.controllers.timeSliderLeft.update(value);
    App.controllers.timeSliderRight.update(value);
  }

  function overlayOpt(value) {
    console.log(value);
    App.models.applicationState.setOverlayMode(value);

    if (self.sliceSelected.imageSliceLeft) {
      App.views.imageSliceLeft.updateOverlay();
    }
    if (self.sliceSelected.imageSliceRight) {
      App.views.imageSliceRight.updateOverlay();
    }
  }

  return {
    load,
    timeOpt,
    overlayOpt
  };

}
