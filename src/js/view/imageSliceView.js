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

    currentTime: 50
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

    let targetName = targetID.substr(1);

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
    let currentTime = App.models.applicationState.getTimeStart();
    let mode = App.models.applicationState.getOverlayMode();

    self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[currentTime]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes" + targetName)
      .attr("cx", (d) => d % 172 + 2)
      .attr("cy", (d) => Math.floor(d / 172) + 2)
      .attr("r", 0.5)
      .style("fill", (d) => App.colorScale[self.networkDynamics[currentTime][d][self.overlayMode[mode]]]);

  }

  function updateOverlay() {
    let targetName = targetID.substr(1);
    let currentTime = App.models.applicationState.getTimeStart();
    let mode = App.models.applicationState.getOverlayMode();
    console.log(currentTime);

    // let bind = self.targetSvg.selectAll(".activeNodes" + targetName)
    //   .data(Object.keys(self.networkDynamics[currentTime]));
    //
    // bind.exit().remove();
    //
    // self.targetSvg.selectAll(".activeNodes" + targetName)
    //   .style("fill", (d) => App.colorScale[self.networkDynamics[currentTime][d][1]]);
    //
    // bind.enter()
    //   .append("circle")
    //   .attr("class", "activeNodes" + targetName)
    //   .attr("cx", (d) => d % 172)
    //   .attr("cy", (d) => Math.floor(d / 172))
    //   .attr("r", 0.5)
    //   .style("fill", (d) => App.colorScale[self.networkDynamics[currentTime][d][1]]);

    d3.selectAll(".activeNodes" + targetName).remove();

    self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[currentTime]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes" + targetName)
      .attr("cx", (d) => d % 172 + 2)
      .attr("cy", (d) => Math.floor(d / 172) + 2)
      .attr("r", 0.5)
      .style("fill", (d) => App.colorScale[self.networkDynamics[currentTime][d][self.overlayMode[mode]]]);

  }


  return {
    update,
    updateOverlay
  };

}
