"use stric"

var App = App || {};

let ImageSliceView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null
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

}
