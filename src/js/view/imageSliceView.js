"use stric"

var App = App || {};

let ImageSliceView = function (targetID) {

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
    d3.selectAll(".activeNodes" + targetName).remove();

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
    // self.targetSvg.selectAll("circle")
    //   .data(Object.keys(self.networkDynamics[self.currentTime]))
    //   .enter()
    //   .append("circle")
    //   .attr("class", "activeNodes" + targetName)
    //   .attr("cx", (d) => d % 172 + 2)
    //   .attr("cy", (d) => Math.floor(d / 172) + 2)
    //   .attr("r", 0.5)
    //   .style("fill", (d) => {
    //     if (mode === "nodeDegree") {
    //       return self.noDegColorScale(self.networkDynamics[self.currentTime][d][self.overlayMode[self.modeOverlay]]);
    //     } else {
    //       return App.colorScale[self.networkDynamics[self.currentTime][d][self.overlayMode[self.modeOverlay]]];
    //     }
    //   });

  }


  function updateOverlay() {
    // get the current overlay mode, time mode, current time, timeStart and timeSpan
    self.timeMode = App.models.applicationState.getTimeSliderMode();
    self.currentTime = App.models.applicationState.getTimeStep(targetID.substr(11));
    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    self.modeOverlay = App.models.applicationState.getOverlayMode();

    let animationMode = App.models.applicationState.getAnimationMode();
    console.log(self.currentTime);
    
    if (animationMode.play) { // play
      console.log("play");      
      App.animationId[targetID.substr(1)] = setInterval(frame, 5);

      function frame() {
        if (self.currentTime <= 100) {
          colorActiveNodes();
          self.currentTime++;
          App.models.applicationState.setTimeStep("Left", self.currentTime);
        } else {
          clearInterval(App.animationId[targetID.substr(1)]);
          App.controllers.imageSlice.stopAnimation();
        }
      }
    } 
    // else if (!animationMode.play && !animationMode.stop) { // pause
    //   console.log("pause");
    //   clearInterval(App.animationId);
    //   colorActiveNodes();
    // } 
    else { // pause or stop
      console.log("stop");
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
      });
  }


  return {
    update,
    updateOverlay
  };

}