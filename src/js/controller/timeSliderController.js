"use strict"

var App = App || {};

let TimeSliderController = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,
    handle: null,

    timeBrush: null,
    timeSlider: null,
    timeScale: null,
    timeScale2: null,

    timeStart: 0,
    timeSpan: 0,
    timeStep: 0
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
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", 198)
      .attr("height", 28)
      .style("fill", "none")
      .style("stroke", App.colorHighlight[targetID.substr(11)])
      .style("stroke-width", 1);


    self.timeScale = d3.scaleLinear()
      .domain([0, 100])
      .range([1, 197]);

    self.timeScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([1, 197]);

    self.timeBrush = d3.brushX()
      .extent([
        [0, 0],
        [200, 30]
      ])
      .on("end", brushed);

    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    self.timeStep = App.models.applicationState.getTimeStep(targetID.substr(11));

    // initialize the brush in the time duration mode
    self.targetSvg.append("g")
      .attr("class", "brush")
      .attr("class", "brush" + targetID.substr(1))
      .call(self.timeBrush)
      // .call(self.timeBrush.move, self.timeScale.range());
      .call(self.timeBrush.move, [self.timeScale(self.timeStart), self.timeScale(self.timeStart + self.timeSpan)]);

    // time slider in the time step mode
    self.timeSlider = self.targetSvg.append("rect")
      .attr("class", "slider" + targetID.substr(1))
      .attr("x", self.timeScale2(self.timeStep))
      .attr("y", 1)
      .attr("width", 3)
      .attr("height", 28)
      .style("fill", "black")
      .style("opacity", 0.3)
      .call(d3.drag()
        .on("start drag", drag)
      )
      .style("cursor", "crosshair")
      .style("display", "none");
  }


  function drag() {
    d3.select(this).attr("x", d3.event.x);

    self.timeStep = self.timeScale2.invert(d3.event.x);

    //update the application state
    App.models.applicationState.setTimeStep(targetID.substr(11), self.timeStep);

    // update the image slice view
    App.views["imageSlice" + targetID.substr(11)].updateOverlay();
  }


  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.

    let s = d3.event.selection || self.timeScale2.range();
    self.timeScale.domain(s.map(self.timeScale2.invert, self.timeScale2));
    // console.log(self.timeScale.domain());

    self.timeStart = self.timeScale.domain()[0];
    self.timeSpan = self.timeScale.domain()[1] - self.timeStart;

    // update the application state
    App.models.applicationState.setTimeStart(targetID.substr(11), self.timeStart);
    App.models.applicationState.setTimeSpan(targetID.substr(11), self.timeSpan);

    // update the image slice view
    App.views["imageSlice" + targetID.substr(11)].updateOverlay();
  }


  function checkSyncTime() {

  }


  function update(mode) {
    if (mode === "timeDuration") {
      d3.select(".brush" + targetID.substr(1)).style("display", "block");
      d3.select(".slider" + targetID.substr(1)).style("display", "none");
    } else if (mode === "timeStep") {
      d3.select(".brush" + targetID.substr(1)).style("display", "none");
      d3.select(".slider" + targetID.substr(1)).style("display", "block");
    }
  }


  return {
    update
  };

}
