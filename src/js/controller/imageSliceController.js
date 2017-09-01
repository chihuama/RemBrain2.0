"use strict"

var App = App || {};

let ImageSliceController = function() {

  function timeOpt(value) {
    console.log(value);
    App.models.applicationState.setTimeSliderMode(value);

    App.controllers.timeSliderLeft.update(value);
    App.controllers.timeSliderRight.update(value);
  }

  function overlayOpt(value) {
    console.log(value);
    App.models.applicationState.setOverlayMode(value);

    if (App.models.applicationState.checkSliceSelected("Left")) {
      App.views.imageSliceLeft.updateOverlay();
    }
    if (App.models.applicationState.checkSliceSelected("Right")) {
      App.views.imageSliceRight.updateOverlay();
    }
  }

  return {
    timeOpt,
    overlayOpt
  };

}
