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

    noDegColorScale: null,

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
    let targetName = targetID.substr(1);
    let mode = App.models.applicationState.getOverlayMode();
    let timeMode = App.models.applicationState.getTimeSliderMode();
    let currentTime = App.models.applicationState.getTimeStep(targetID.substr(11));
    let timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    let timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));


    // get the max node degree from both sides
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
    self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[currentTime]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes" + targetName)
      .attr("cx", (d) => d % 172 + 2)
      .attr("cy", (d) => Math.floor(d / 172) + 2)
      .attr("r", 0.5)
      .style("fill", (d) => {
        if (mode === "nodeDegree") {
          return self.noDegColorScale(self.networkDynamics[currentTime][d][self.overlayMode[mode]]);
        } else {
          return App.colorScale[self.networkDynamics[currentTime][d][self.overlayMode[mode]]];
        }
      });

  }


  function updateOverlay() {
    // get the current overlay mode, time mode, current time, timeStart and timeSpan
    let targetName = targetID.substr(1);
    let mode = App.models.applicationState.getOverlayMode();
    let timeMode = App.models.applicationState.getTimeSliderMode();
    let currentTime = App.models.applicationState.getTimeStep(targetID.substr(11));
    let timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    let timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    // console.log(currentTime);

    d3.selectAll(".activeNodes" + targetName).remove();

    self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[currentTime]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes" + targetName)
      .attr("cx", (d) => d % 172 + 2)
      .attr("cy", (d) => Math.floor(d / 172) + 2)
      .attr("r", 0.5)
      .style("fill", (d) => {
        if (mode === "nodeDegree") {
          return self.noDegColorScale(self.networkDynamics[currentTime][d][self.overlayMode[mode]]);
        } else {
          return App.colorScale[self.networkDynamics[currentTime][d][self.overlayMode[mode]]];
        }
      });
      // .style("fill", function(d) {
      //   let overlayValue;
      //
      //   if (timeMode === "timeStep") {
      //     overlayValue = self.networkDynamics[currentTime][d][self.overlayMode[mode]];
      //   } else {
      //     for (let i = timeStart; i < (timeStart + timeSpan); i++) {
      //       overlayValue += self.networkDynamics[i][d][self.overlayMode[mode]];
      //     }
      //     overlayValue = Math.round(overlayValue / timeSpan);
      //     console.log(overlayValue);
      //   }
      //
      //   if (mode === "nodeDegree") {
      //     return self.noDegColorScale(overlayValue);
      //   } else {
      //     return App.colorScale[overlayValue];
      //   }
      // });

  }


  return {
    update,
    updateOverlay
  };

}
