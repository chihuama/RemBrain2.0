"use strict"

var App = App || {};

let TimeSliderController = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,
    handle: null,

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
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", 198)
      .attr("height", 28)
      .style("fill", "none")
      .style("stroke", App.colorHighlight[targetID.substr(11)])
      .style("stroke-width", 1);

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

    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));

    // initialize the brush
    self.targetSvg.append("g")
      .attr("class", "brush")
      .attr("class", "brush" + targetID.substr(1))
      .call(self.timeBrush)
      // .call(self.timeBrush.move, self.timeScale.range());
      .call(self.timeBrush.move, [self.timeScale(self.timeStart), self.timeScale(self.timeStart + self.timeSpan)]);
    //
    // let slider = self.targetSvg.append("g")
    //   .attr("class", "slider")
    //   .attr("class", "slider" + targetID.substr(1))
    //   // .attr("transform", "translate(0, 15)")
    //   .style("display", "none");
    //
    // slider.append("line")
    //   .attr("class", "track")
    //   .attr("x1", self.timeScale2.range()[0])
    //   .attr("x2", self.timeScale2.range()[1])
    //   .select(function() {
    //     return this.parentNode.appendChild(this.cloneNode(true));
    //   })
    //   .attr("class", "track-inset")
    //   .select(function() {
    //     return this.parentNode.appendChild(this.cloneNode(true));
    //   })
    //   .attr("class", "track-overlay")
    //   .call(d3.drag()
    //     .on("start.interrupt", function() {
    //       slider.interrupt();
    //     })
    //     .on("start drag", function() {
    //       hue(d3.event.x);
    //     }));
    //
    // self.handle = slider.insert("rect", ".track-overlay")
    //   .attr("class", "handle")
    //   .attr("class", "handle" + targetID.substr(1))
    //   .attr("width", 3)
    //   .attr("height", 30);

    // self.handle = self.targetSvg.append("circle")
    //   .attr("class", "handle" + targetID.substr(1))
    //   .attr("cx", (d) => 0)
    //   .attr("cy", (d) => 15)
    //   .attr("r", 3)
    //   .style("cursor", "ew-resize")
    //   .call(d3.drag()
    //     .on("start darg", dragmove)
    //   );
  }


  function hue(h) {
    console.log(h);
    self.handle.attr("x", h);
    // svg.style("background-color", d3.hsl(h, 0.8, 0.8));
  }

  function dragmove(d) {
    // Get the updated X location computed by the drag behavior.
    var x = d3.event.x;

    // Constrain x to be between x1 and x2 (the ends of the line).
    // x = x < x1 ? x1 : x > x2 ? x2 : x;

    // This assignment is necessary for multiple drag gestures.
    // It makes the drag.origin function yield the correct value.
    d.x = x;

    // Update the circle location.
    circle.attr("cx", x);
  }

  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.

    let s = d3.event.selection || self.timeScale2.range();
    self.timeScale.domain(s.map(self.timeScale2.invert, self.timeScale2));
    // console.log(self.timeScale.domain());

    self.timeStart = self.timeScale.domain()[0];
    self.timeSpan = self.timeScale.domain()[1] - self.timeStart;

    // update models
    App.models.applicationState.setTimeStart(targetID.substr(11), self.timeStart);
    App.models.applicationState.setTimeSpan(targetID.substr(11), self.timeSpan);

    // update views
    App.views["imageSlice" + targetID.substr(11)].updateOverlay();

  }


  function checkSyncTime() {

  }


  function update(mode) {
    if (mode === "timeDuration") {
      d3.select(".brush" + targetID.substr(1)).style("display", "block");
      // d3.select(".slider" + targetID.substr(1)).selectAll("*").style("display", "none");
      d3.select(".handle" + targetID.substr(1)).style("display", "none");
    } else if (mode === "timeStep") {
      d3.select(".brush" + targetID.substr(1)).style("display", "none");
      // d3.select(".slider" + targetID.substr(1)).style("display", "block");
      d3.select(".handle" + targetID.substr(1)).style("display", "block");
    }
  }


  return {
    update
  };

}
