"use stric"

var App = App || {};

let ImageSliceView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    animalId: null,
    activationId: null,
    networkDynamics: {},

    currentTime: 50
  }

  init();

  function init() {
    self.targetElement = d3.select(targetID);

    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 172 130")
      .attr("preserveAspectRatio", "xMidYMid")
      .style("background", "white");
  }

  function updateView() {
    self.animalId = App.models.applicationState.getSelectedAnimalId();
    self.activationId = App.models.applicationState.getSelectedActivationId();
    self.networkDynamics = App.models.networkDynamics.getNetworkDynamics();

    console.log("update " + targetID + "with " + self.animalId + "-" + self.activationId);
    console.log(self.networkDynamics);

    // load image
    d3.select(".image" + targetID).remove();
    let img = self.targetSvg.append("image")
      .attr("class", "image" + targetID)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 172)
      .attr("height", 130)
      .attr("xlink:href", "data/" + self.animalId + "/" + self.activationId + "/imageSlice.jpg");

    // dynamic community info for all active nodes
    let time = 50;

    let node = self.targetSvg.selectAll("circle")
      .data(Object.keys(self.networkDynamics[50]))
      .enter()
      .append("circle")
      .attr("class", "activeNodes")
      .attr("cx", (d) => d % 172)
      .attr("cy", (d) => Math.floor(d / 172))
      .attr("r", 0.5)
      .style("fill", (d) => App.colorScale[self.networkDynamics[50][d][1]]);

  }


  return {
    updateView
  };

}
