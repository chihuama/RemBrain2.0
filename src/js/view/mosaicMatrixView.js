"use strict"

var App = App || {};

let MosaicMatrixView = function(targetID) {
  let self = {
    targetElementUp: null,
    targetSvgUp: null,
    targetElementBottom: null,
    targetSvgBottom: null,

    active: {
      "Up": false,
      "Bottom": false
    }
  };

  init();

  function init() {
    self.targetElementUp = d3.select(targetID + "-Up");
    self.targetElementBottom = d3.select(targetID + "-Bottom");

    self.targetSvgUp = self.targetElementUp.append("svg")
      .attr("width", self.targetElementUp.node().clientWidth)
      .attr("height", self.targetElementUp.node().clientHeight)
      .attr("viewBox", "0 0 100 100")
      .attr("preserveAspectRatio", "xMidYMid");

    self.targetSvgBottom = self.targetElementBottom.append("svg")
      .attr("width", self.targetElementBottom.node().clientWidth)
      .attr("height", self.targetElementBottom.node().clientHeight)
      .attr("viewBox", "0 0 100 100")
      .attr("preserveAspectRatio", "xMidYMid");

    // boundary
    self.targetSvgUp.append("rect")
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", 98)
      .attr("height", 98)
      .style("fill", "none")
      .style("stroke", "#b2182b")
      .style("stroke-width", 1);

    self.targetSvgBottom.append("rect")
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", 98)
      .attr("height", 98)
      .style("fill", "none")
      .style("stroke", "#2166ac")
      .style("stroke-width", 1);
  }

  return {

  };

}
