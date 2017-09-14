"use strict"

var App = App || {};

let ImageSliceController = function() {

  let self = {
    currentTime: 50,
    play: false,
    stop: false,

    zoomSvg: null,
    zoomSizeScale: null,
    mosaicMatrix: {
      "Left": ["Up", "Bottom"],
      "Right": ["Up", "Bottom"]
    }
  };

  zoomSizeSlider();

  function zoomSizeSlider() {
    let zoomElement = d3.select("#zoomSize");

    self.zoomSvg = zoomElement.append("svg")
      .attr("width", zoomElement.node().clientWidth)
      .attr("height", zoomElement.node().clientHeight)
      .attr("viewBox", "0 0 100 15")
      .attr("preserveAspectRatio", "xMidYMin");

    self.zoomSizeScale = d3.scaleLinear()
      .domain([2, 10])
      .range([10, 90]);

    self.zoomSvg.append("rect")
      .attr("x", 10)
      .attr("y", 4)
      .attr("width", 80)
      .attr("height", 3)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("fill", "#bdbdbd")
      .style("stroke", "none");

    // labels
    for (let i = 2; i <= 10; i++) {
      self.zoomSvg.append("text")
        .attr("x", self.zoomSizeScale(i))
        .attr("y", 14)
        .style("fill", "black")
        .style("text-anchor", "middle")
        .style("font-size", "5px")
        .text(i);
    }

    let zoomSize = App.models.applicationState.getZoomSize();

    self.zoomSvg.append("circle")
      .attr("cx", self.zoomSizeScale(zoomSize))
      .attr("cy", 5.5)
      .attr("r", 3)
      .style("fill", "white")
      .style("stroke", "#252525")
      .style("stroke-width", 0.5)
      .call(d3.drag()
        .on("start drag", drag)
      )
      .style("cursor", "crosshair");
  }

  function drag() {
    let xPos = d3.event.x;
    if (xPos < 10) {
      xPos = 10;
    } else if (xPos > 90) {
      xPos = 90;
    }

    //update the application state
    let zoomSize = Math.round(self.zoomSizeScale.invert(xPos));
    App.models.applicationState.setZoomSize(zoomSize);

    // update the xpos of the slider handle
    d3.select(this).attr("cx", self.zoomSizeScale(zoomSize));

    // update mosaic matrix views
    _.forEach(Object.keys(self.mosaicMatrix), function(side) {
      _.forEach(self.mosaicMatrix[side], function(dir) {
        if (App.models.applicationState.getMosaicMatrixMode(side, dir) && App.models.applicationState.checkSliceSelected(side)) {
          updateMosaicMatrix(side, dir);

          // update the highlight rect in the image slice view
          App.views["imageSlice" + side].updateMosaicMatrix(dir);
        }
      });
    });

  }


  function timeOpt(value) {
    console.log(value);
    App.models.applicationState.setTimeSliderMode(value);

    App.controllers.timeSliderLeft.update(value);
    App.controllers.timeSliderRight.update(value);

    // update image slice views
    _.forEach(Object.keys(self.mosaicMatrix), function(side) {
      if (App.models.applicationState.checkSliceSelected(side)) {
        updateImageSlice(side);
      }
    });
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

      // update image slice views
      _.forEach(Object.keys(self.mosaicMatrix), function(side) {
        if (App.models.applicationState.checkSliceSelected(side)) {
          updateImageSlice(side);
        }
      });
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

    // update views
    _.forEach(Object.keys(self.mosaicMatrix), function(side) {
      if (App.models.applicationState.checkSliceSelected(side)) {
        updateImageSlice(side);
      }

      _.forEach(self.mosaicMatrix[side], function(dir) {
        if (App.models.applicationState.getMosaicMatrixMode(side, dir) && App.models.applicationState.checkSliceSelected(side)) {
          updateMosaicMatrix(side, dir);
        }
      });
    });
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

        d3.select(".inactive-Left" + value).style("display", "none");
        d3.select(".inactive-Right" + value).style("display", "none");

      } else {
        d3.select("#" + side + "-" + value).select("span").attr("class", "glyphicon glyphicon-eye-open");
        d3.select(".inactive-" + side + value).style("display", "none");
      }
    }
  }


  function updateImageSlice(side) {
    App.views["imageSlice" + side].updateOverlay();
  }

  function updateMosaicMatrix(side, direction) {
    App.views["mosaicMatrix" + side].update(direction);
  }


  return {
    timeOpt,
    animationOpt,
    stopAnimation,
    overlayOpt,
    mosaicMatrixOpt,
    updateMosaicMatrix
  };

}
