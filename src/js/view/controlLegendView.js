"use strict"

var App = App || {};

let ControlLegendView = function() {
  let self = {
    dyCommElement: null,
    dyCommSvg: null,
    noDegElement: null,
    noDegSvg: null
  };

  init();

  function init() {
    self.dyCommElement = d3.select("#dynamicCommunity");
    self.noDegElement = d3.select("#nodeDegree");

    self.dyCommSvg = self.dyCommElement.append("svg")
      .attr("width", self.dyCommElement.node().clientWidth)
      .attr("height", self.dyCommElement.node().clientHeight)
      .attr("viewBox", "0 0 260 110")
      .attr("preserveAspectRatio", "xMidYMid");

    self.noDegSvg = self.noDegElement.append("svg")
      .attr("width", self.noDegElement.node().clientWidth)
      .attr("height", self.noDegElement.node().clientHeight)
      .attr("viewBox", "0 0 100 20")
      .attr("preserveAspectRatio", "xMidYMid");

    dyCommLegend();
    noDegLegend();
  }

  function dyCommLegend() {
    for (let i = 0; i < 10; i++) {
      self.dyCommSvg.append("circle")
        .attr("class", "dyCommLegend")
        .attr("cx", 30 + (i % 5) * 50)
        .attr("cy", 30 + Math.floor(i / 5) * 50)
        .attr("r", 20)
        .style("fill", App.colorScale[i + 1])
        .style("stroke", "none");
    }
  }

  function noDegLegend() {
    // create the svg:defs element and the main gradient definition
    let svgDefs = self.noDegSvg.append("defs");
    let legendGradient = svgDefs.append("linearGradient")
      .attr("id", "noDegLegendGradient");

    // create the stops of the main gradient
    legendGradient.append("stop")
      .attr("class", "noDegLegend-left")
      .attr("offset", "0");

    legendGradient.append("stop")
      .attr("class", "noDegLegend-middle")
      .attr("offset", "0.5");

    legendGradient.append("stop")
      .attr("class", "noDegLegend-right")
      .attr("offset", "1");

    // horizontal gradient
    legendGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    self.noDegSvg.append("rect")
      .classed("noDegLegend-filled", true)
      .attr("x", 10)
      .attr("y", 0)
      .attr("width", 80)
      .attr("height", 20)
      .style("opacity", 0.95);
  }
}
