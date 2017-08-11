"use strict"

var App = App || {};

let TimeSliderController = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    timeBrush: null,
    timeScale: null,
    timeScale2: null,

    timeStart: 20,
    timeSpan: 10
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);

    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 200 30")
      .attr("preserveAspectRatio", "xMidYMin")
      .style("background", "white");

    let boundary = self.targetSvg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 200)
      .attr("height", 30)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 0.5);

    self.timeScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 200]);

    self.timeScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 200]);
  }

  function update() {
    self.timeBrush = d3.brushX()
      .extent([
        [0, 0],
        [200, 30]
      ])
      .on("brush end", brushed);

    self.targetSvg.append("g")
      .attr("class", "brush")
      .call(self.timeBrush)
      // .call(self.timeBrush.move, self.timeScale.range());
      .call(self.timeBrush.move, [self.timeScale(self.timeStart), self.timeScale(self.timeStart + self.timeSpan)]);

  }

  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.

    let s = d3.event.selection || self.timeScale2.range();
    self.timeScale.domain(s.map(self.timeScale2.invert, self.timeScale2));
  }


  return {
    update
  };

}
