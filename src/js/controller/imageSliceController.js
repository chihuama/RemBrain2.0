"use strict"

var App = App || {};

let ImageSliceController = function () {

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
      console.log(self.play + "-" + self.stop);

      App.models.applicationState.setAnimationMode(self.play, self.stop);

      if (self.play) { // play
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-pause");
        self.currentTime = App.models.applicationState.getTimeStep("Left");

        // reset to 0 from the last time step
        if (self.currentTime == 101) {
          self.currentTime = 0;
          App.models.applicationState.setTimeStep("Left", self.currentTime);
          App.models.applicationState.setTimeStep("Right", self.currentTime);          
        }
      } else if (!self.play && !self.stop) { // pause
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");
        // need to work on sync the time on both side
      } else { // stop
        d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");

        // rest the current time to 0
        self.currentTime = 0;
        App.models.applicationState.setTimeStep("Left", self.currentTime);
        App.models.applicationState.setTimeStep("Right", self.currentTime);                  
      }

      updateViews();
    }
  }

  function stopAnimation() {
    self.play = false;
    self.stop = true;
    d3.select("#play").select("span").attr("class", "glyphicon glyphicon-play");
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


  return {
    timeOpt,
    animationOpt,
    stopAnimation,
    overlayOpt
  };

}