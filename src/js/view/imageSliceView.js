"use stric"

var App = App || {};

let ImageSliceView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    animalId: null,
    activationId: null,
    networkDynamics: {},

    overlayMode: {
      "homeComm": 0,
      "tempComm": 1,
      "nodeDegree": 2
    },
    modeOverlay: null,

    noDegColorScale: null,

    timeMode: null,
    timeStart: 0,
    timeSpan: 0,
    currentTime: 0
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);

    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 176 134")
      .attr("preserveAspectRatio", "xMidYMid")
      .style("background", "white");

    self.targetSvg.append("rect")
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", 174)
      .attr("height", 132)
      .style("fill", "none")
      .style("stroke", App.colorHighlight[targetID.substr(11)])
      .style("stroke-width", 2);
  }


  function update() {
    self.animalId = App.models.applicationState.getSelectedAnimalId();
    self.activationId = App.models.applicationState.getSelectedActivationId();
    self.networkDynamics = App.models.networkDynamics.getNetworkDynamics();

    console.log("update " + targetID + " with " + self.animalId + "-" + self.activationId);
    console.log(self.networkDynamics);

    // get the current overlay mode, time mode, current time, timeStart and timeSpan
    self.timeMode = App.models.applicationState.getTimeSliderMode();
    self.currentTime = App.models.applicationState.getTimeStep(targetID.substr(11));
    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    self.modeOverlay = App.models.applicationState.getOverlayMode();

    // get the max node degree from both sides
    let targetName = targetID.substr(1);
    let maxNodeDegree = App.models.networkDynamics.getMaxNodeDegree();
    App.models.applicationState.setMaxNodeDegree(targetName, maxNodeDegree);
    let maxNodeDegreeBoth = App.models.applicationState.getMaxNodeDegree();

    // color scale for node degrees
    self.noDegColorScale = d3.scaleLinear()
      .interpolate(d3.interpolateHcl)
      .domain([0, maxNodeDegreeBoth])
      .range(["#deebf7", "#08306b"]);


    d3.select(".image" + targetName).remove();

    // load image
    let img = self.targetSvg.append("image")
      .attr("class", "image" + targetName)
      .attr("x", 2)
      .attr("y", 2)
      .attr("width", 172)
      .attr("height", 130)
      .attr("xlink:href", "data/" + self.animalId + "/" + self.activationId + "/imageSlice.jpg");

    // dynamic community info for all active nodes
    colorActiveNodes();
  }


  function updateOverlay() {
    // get the current overlay mode, time mode, current time, timeStart and timeSpan
    self.timeMode = App.models.applicationState.getTimeSliderMode();
    self.currentTime = App.models.applicationState.getTimeStep(targetID.substr(11));
    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    self.modeOverlay = App.models.applicationState.getOverlayMode();
    // console.log(self.currentTime);
    let animationMode = App.models.applicationState.getAnimationMode();

    if (animationMode.play) { // play
      App.animationId[targetID.substr(1)] = setInterval(frame, 200);

      function frame() {
        if (self.currentTime <= 100) {
          colorActiveNodes();
          self.currentTime++;
          App.models.applicationState.setTimeStep("Left", self.currentTime);
          App.models.applicationState.setTimeStep("Right", self.currentTime);

          App.controllers.timeSliderLeft.animationOn();
          App.controllers.timeSliderRight.animationOn();
        } else {
          clearInterval(App.animationId[targetID.substr(1)]);
          App.controllers.imageSlice.stopAnimation();
        }
      }
    } else { // pause or stop
      clearInterval(App.animationId[targetID.substr(1)]);
      colorActiveNodes();
    }
  }


  function colorActiveNodes() {
    let targetName = targetID.substr(1);
    d3.selectAll(".activeNodes" + targetName).remove();

    self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[self.currentTime]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes" + targetName)
      .attr("cx", (d) => d % 172 + 2)
      .attr("cy", (d) => Math.floor(d / 172) + 2)
      .attr("r", 0.5)
      .style("fill", (d) => {
        if (self.modeOverlay === "nodeDegree") {
          return self.noDegColorScale(self.networkDynamics[self.currentTime][d][self.overlayMode[self.modeOverlay]]);
        } else {
          return App.colorScale[self.networkDynamics[self.currentTime][d][self.overlayMode[self.modeOverlay]]];
        }
      })
      .on("mouseover", function(d) {
        mouseoverCallBack(d);
      })
      .on("mouseout", function() {
        mouseoutCallBack();
      })
      .on("click", function(d) {
        mouseclickCallBack(d);
      });

    // always display the select rect on the top
    let _thisUp = d3.select(".selectMosaicMatrix-" + targetID.substr(11) + "-Up")["_groups"][0][0];
    let _thisBottom = d3.select(".selectMosaicMatrix-" + targetID.substr(11) + "-Bottom")["_groups"][0][0];

    if (_thisUp && _thisBottom) {
      _thisUp.parentNode.appendChild(_thisUp);
      _thisBottom.parentNode.appendChild(_thisBottom);
    } else if (_thisUp) {
      _thisUp.parentNode.appendChild(_thisUp);
    } else if (_thisBottom) {
      _thisBottom.parentNode.appendChild(_thisBottom);
    }
  }

  function mouseoverCallBack(d) {
    let zoomSync = App.models.applicationState.getZoomSync();
    let up = App.models.applicationState.getMosaicMatrixMode(targetID.substr(11), "Up");
    let bottom = App.models.applicationState.getMosaicMatrixMode(targetID.substr(11), "Bottom");

    if (up) {
      if (zoomSync) {
        syncHighlight(d, "Up");
      } else {
        highlightMosaicMatrix(d, targetID.substr(11), "Up");
      }
    } else if (bottom) {
      if (zoomSync) {
        syncHighlight(d, "Bottom");
      } else {
        highlightMosaicMatrix(d, targetID.substr(11), "Bottom");
      }
    }
  }

  function mouseoutCallBack() {
    let zoomSync = App.models.applicationState.getZoomSync();

    if (zoomSync) {
      d3.select(".highlightMosaicMatrix-Left-Up").remove();
      d3.select(".highlightMosaicMatrix-Left-Bottom").remove();
      d3.select(".highlightMosaicMatrix-Right-Up").remove();
      d3.select(".highlightMosaicMatrix-Right-Bottom").remove();
    } else {
      d3.select(".highlightMosaicMatrix-" + targetID.substr(11) + "-Up").remove();
      d3.select(".highlightMosaicMatrix-" + targetID.substr(11) + "-Bottom").remove();
    }
  }

  function mouseclickCallBack(d) {
    let zoomSync = App.models.applicationState.getZoomSync();
    let up = App.models.applicationState.getMosaicMatrixMode(targetID.substr(11), "Up");
    let bottom = App.models.applicationState.getMosaicMatrixMode(targetID.substr(11), "Bottom");

    if (up) {
      if (zoomSync) {
        syncSelection(d, "Up");
      } else {
        selectMosaicMatrix(d, targetID.substr(11), "Up");
      }
    } else if (bottom) {
      if (zoomSync) {
        syncSelection(d, "Bottom");
      } else {
        selectMosaicMatrix(d, targetID.substr(11), "Bottom");
      }
    }
  }

  function syncHighlight(d, dir) {
    if (App.models.applicationState.checkSliceSelected("Left")) {
      App.views.imageSliceLeft.highlightMosaicMatrix(d, "Left", dir);
    }
    if (App.models.applicationState.checkSliceSelected("Right")) {
      App.views.imageSliceRight.highlightMosaicMatrix(d, "Right", dir);
    }
  }

  function syncSelection(d, dir) {
    if (App.models.applicationState.checkSliceSelected("Left")) {
      App.views.imageSliceLeft.selectMosaicMatrix(d, "Left", dir);
    }
    if (App.models.applicationState.checkSliceSelected("Right")) {
      App.views.imageSliceRight.selectMosaicMatrix(d, "Right", dir);
    }
  }

  function highlightMosaicMatrix(pixelId, side, direction) {
    d3.select(".highlightMosaicMatrix-" + side + "-" + direction).remove();

    let size = App.models.applicationState.getZoomSize();

    self.targetSvg.append("rect")
      .attr("class", "highlightMosaicMatrix-" + side + "-" + direction)
      .attr("x", pixelId % 172 + 2 - Math.floor(size / 2))
      .attr("y", Math.floor(pixelId / 172) + 2 - Math.floor(size / 2))
      .attr("width", size)
      .attr("height", size)
      .style("fill", "none")
      .style("stroke", App.colorHighlight[direction])
      .style("stroke-width", 1)
  }

  function selectMosaicMatrix(pixelId, side, direction) {
    d3.select(".highlightMosaicMatrix-" + side + "-" + direction).remove();
    d3.select(".selectMosaicMatrix-" + side + "-" + direction).remove();

    let size = App.models.applicationState.getZoomSize();

    self.targetSvg.append("rect")
      .attr("class", "selectMosaicMatrix-" + side + "-" + direction)
      .attr("x", pixelId % 172 + 2 - Math.floor(size / 2))
      .attr("y", Math.floor(pixelId / 172) + 2 - Math.floor(size / 2))
      .attr("width", size)
      .attr("height", size)
      .style("fill", "black")
      .style("opacity", 0.65)
      .style("stroke", App.colorHighlight[direction])
      .style("stroke-width", 1);
  }


  return {
    update,
    updateOverlay,
    highlightMosaicMatrix,
    selectMosaicMatrix
  };

}
