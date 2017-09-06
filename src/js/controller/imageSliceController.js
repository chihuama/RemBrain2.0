"use strict"

var App = App || {};

let ImageSliceController = function() {

  let self = {
    play: false,
    stop: false,

    currentTime: 50
  };

  function timeOpt(value) {
    console.log(value);
    App.models.applicationState.setTimeSliderMode(value);

    App.controllers.timeSliderLeft.update(value);
    App.controllers.timeSliderRight.update(value);

    updateViews();
  }

  function animationOpt(value) {
    let timeSync = App.models.applicationState.getTimeSync();
    let timeMode = App.models.applicationState.getTimeSliderMode();

    if (timeSync && timeMode === "timeStep") {
      if (value === "play") {
        self.play = !self.play;
        self.stop = false;
      } else if (value === "stop") {
        self.play = false;
        self.stop = true;
      }

      App.models.applicationState.setAnimationMode(self.play, self.stop);

      // sync the time
      let leftTime = App.models.applicationState.getTimeStep("Left");
      App.models.applicationState.setTimeStep("Right", leftTime);

      if (self.play) { // play
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-pause");
      } else if (!self.play && !self.stop) { // pause
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");
      } else { // stop
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");

        // rest the current time to 0
        self.currentTime = 0;
        App.models.applicationState.setTimeStep("Left", self.currentTime);
        App.models.applicationState.setTimeStep("Right", self.currentTime);

        App.controllers.timeSliderLeft.animationOn();
        App.controllers.timeSliderRight.animationOn()
      }

      updateViews();
    }
  }

  function stopAnimation() {
    self.play = false;
    self.stop = true;
    d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");

    // reset to 0 from the last time step
    self.currentTime = 0;
    App.models.applicationState.setTimeStep("Left", self.currentTime);
    App.models.applicationState.setTimeStep("Right", self.currentTime);
  }


  function overlayOpt(value) {
    console.log(value);
    App.models.applicationState.setOverlayMode(value);

    updateViews();
  }

  function updateViews() {
    if (App.models.applicationState.checkSliceSelected("Left")) {
      App.views.imageSliceLeft.updateOverlay();
    }
    if (App.models.applicationState.checkSliceSelected("Right")) {
      App.views.imageSliceRight.updateOverlay();
    }
  }

  function mosaicMatrixOpt(side, value) {
    console.log(side, value);
    let preCheck = App.models.applicationState.getMosaicMatrixMode(side, value);
    let zoomSync = App.models.applicationState.getZoomSync();

    if (zoomSync) {
      App.models.applicationState.resetMosaicMatrixMode("Left");
      App.models.applicationState.resetMosaicMatrixMode("Right");

      App.models.applicationState.setMosaicMatrixMode("Left", value, !preCheck);
      App.models.applicationState.setMosaicMatrixMode("Right", value, !preCheck);
    } else {
      App.models.applicationState.resetMosaicMatrixMode(side);
      App.models.applicationState.setMosaicMatrixMode(side, value, !preCheck);
    }

    let curCheck = App.models.applicationState.getMosaicMatrixMode(side, value);
    if (curCheck) {
      if (zoomSync) {
        d3.select("#Left-" + value).select("span").attr("class", "glyphicon glyphicon-eye-open");
        d3.select("#Right-" + value).select("span").attr("class", "glyphicon glyphicon-eye-open");
      } else {
        d3.select("#" + side + "-" + value).select("span").attr("class", "glyphicon glyphicon-eye-open");
      }
    } else {
      if (zoomSync) {
        d3.select("#Left-" + value).select("span").attr("class", "glyphicon glyphicon-eye-close");
        d3.select("#Right-" + value).select("span").attr("class", "glyphicon glyphicon-eye-close");
      } else {
        d3.select("#" + side + "-" + value).select("span").attr("class", "glyphicon glyphicon-eye-close");
      }
    }
  }


  return {
    timeOpt,
    animationOpt,
    stopAnimation,
    overlayOpt,
    mosaicMatrixOpt
  };

}
