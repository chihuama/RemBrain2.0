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

    self.timeBrush = d3.brushX()
      .extent([
        [0, 0],
        [200, 30]
      ])
      .on("end", brushed);

    self.timeStart = App.models.applicationState.getTimeStart();
    self.timeSpan = App.models.applicationState.getTimeSpan();

    // initialize the brush
    self.targetSvg.append("g")
      .attr("class", "brush")
      .attr("class", "brush" + targetID.substr(1))
      .call(self.timeBrush)
      // .call(self.timeBrush.move, self.timeScale.range());
      .call(self.timeBrush.move, [self.timeScale(self.timeStart), self.timeScale(self.timeStart + self.timeSpan)]);
  }

  function update(mode) {
    if (mode === "timeDuration") {
      d3.select(".brush" + targetID.substr(1)).style("display", "block");
    } else if (mode === "timeStep") {
      d3.select(".brush" + targetID.substr(1)).style("display", "none");
    }
  }

  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.

    let s = d3.event.selection || self.timeScale2.range();
    self.timeScale.domain(s.map(self.timeScale2.invert, self.timeScale2));

    console.log(self.timeScale.domain());
    self.timeStart = self.timeScale.domain()[0];
    self.timeSpan = self.timeScale.domain()[1] - self.timeStart;

    // update models
    App.models.applicationState.setTimeStart(self.timeStart);
    App.models.applicationState.setTimeSpan(self.timeSpan);

    // update views
    App.views["imageSlice" + targetID.substr(11)].updateOverlay();

  }


  function checkSyncTime() {

  }


  return {
    update
  };

}
