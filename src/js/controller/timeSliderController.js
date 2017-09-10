"use strict"

var App = App || {};

let TimeSliderController = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,
    side: null,

    timeBrush: null,
    timeScale: null,
    timeScale2: null,

    timeSlider: null,
    timeSliderScale: null,

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

    self.side = targetID.substr(11);

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
      .range([1, 198]);

    self.timeScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([1, 198]);

    self.timeSliderScale = d3.scaleLinear()
      .domain([0, 100])
      .range([1, 196]);

    self.timeBrush = d3.brushX()
      .extent([
        [1, 0],
        [198, 30]
      ])
      .on("end", brushed);

    self.timeStart = App.models.applicationState.getTimeStart(self.side);
    self.timeSpan = App.models.applicationState.getTimeSpan(self.side);
    self.timeStep = App.models.applicationState.getTimeStep(self.side);
  }

  function loadViews() {
    stackedDyCommPlots();

    d3.select(".brush" + targetID.substr(1)).remove();
    d3.select(".slider" + targetID.substr(1)).remove();

    // initialize the brush in the time duration mode
    self.targetSvg.append("g")
      .attr("class", "brush" + targetID.substr(1))
      .call(self.timeBrush)
      .call(self.timeBrush.move, [self.timeScale2(self.timeStart), self.timeScale2(self.timeStart + self.timeSpan)]);

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
      .style("cursor", "crosshair");

    let timeMode = App.models.applicationState.getTimeSliderMode();
    update(timeMode);
  }

  function stackedDyCommPlots() {

    let x = d3.scaleLinear().domain([0, 100]).range([1, 199]);
    // let y = d3.scaleLinear().domain([0, App.models.networkDynamics.getMaxActiveNodes()]).range([28, 2]);
    let y = d3.scaleLinear().domain([0, 10000]).range([28, 2]);

    let area = d3.area()
      .x((d) => x(d.data.time))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    let dyCommData = App.models.networkDynamics.getCommunity_distributions();
    let keys = _.dropRight(Object.keys(dyCommData[0]));
    let stack = d3.stack().keys(keys);

    d3.selectAll(".layer-" + targetID.substr(1)).remove();

    let layer = self.targetSvg.append("g").selectAll(".layer-" + targetID.substr(1))
      .data(stack(dyCommData))
      .enter().append("g")
      .attr("class", "layer-" + targetID.substr(1));

    layer.append("path")
      .attr("class", "area")
      .attr("d", area)
      .style("fill", (d) => App.colorScale[d.key])
      .style("opacity", 0.7)
      .style("pointer-events", "none");
  }


  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.

    let s = d3.event.selection || self.timeScale2.range();
    self.timeScale.domain(s.map(self.timeScale2.invert, self.timeScale2));

    self.timeStart = self.timeScale.domain()[0];
    self.timeSpan = self.timeScale.domain()[1] - self.timeStart;

    // update the application state
    App.models.applicationState.setTimeStart(self.side, self.timeStart);
    App.models.applicationState.setTimeSpan(self.side, self.timeSpan);

    // update the image slice view
    App.views["imageSlice" + targetID.substr(11)].updateOverlay();

    // update the mosaic matrix view
    if (App.models.applicationState.getMosaicMatrixMode(self.side, "Up")) {
      App.controllers.imageSlice.updateMosaicMatrix(self.side, "Up");
    } else if (App.models.applicationState.getMosaicMatrixMode(self.side, "Bottom")) {
      App.controllers.imageSlice.updateMosaicMatrix(self.side, "Bottom");
    }

    checkSyncTime();
  }

  function drag() {
    let xPos = d3.event.x;
    if (xPos < 1) {
      xPos = 1;
    } else if (xPos > 196) {
      xPos = 196;
    }

    d3.select(this).attr("x", xPos);

    self.timeStep = self.timeSliderScale.invert(xPos);

    //update the application state
    App.models.applicationState.setTimeStep(self.side, self.timeStep);

    // update the image slice view
    App.views["imageSlice" + self.side].updateOverlay();

    checkSyncTime();
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


  function checkSyncTime() {
    if (!d3.event.sourceEvent.bubbles) return; // Only transition after input.

    let timeSync = App.models.applicationState.getTimeSync();

    if (timeSync) {
      if (_.includes(targetID, "Left")) {
        App.controllers.timeSliderRight.syncTime(self.timeStep, self.timeStart, self.timeSpan);
      } else if (_.includes(targetID, "Right")) {
        App.controllers.timeSliderLeft.syncTime(self.timeStep, self.timeStart, self.timeSpan);
      }
    }
  }

  function syncTime(timeStep, timeStart, timeSpan) {
    self.timeStep = timeStep;
    self.timeStart = timeStart;
    self.timeSpan = timeSpan;

    // update the time slider
    d3.select(".slider" + targetID.substr(1)).attr("x", self.timeSliderScale(self.timeStep));

    // update the time brush
    d3.select(".brush" + targetID.substr(1))
      .call(self.timeBrush.move, [self.timeScale2(self.timeStart), self.timeScale2(self.timeStart + self.timeSpan)]);

    // update the application state
    App.models.applicationState.setTimeStep(self.side, self.timeStep);
    App.models.applicationState.setTimeStart(self.side, self.timeStart);
    App.models.applicationState.setTimeSpan(self.side, self.timeSpan);

    // update the image slice view
    if (App.models.applicationState.checkSliceSelected(self.side)) {
      App.views["imageSlice" + self.side].updateOverlay();
    }
  }

  function animationOn() {
    self.timeStep = App.models.applicationState.getTimeStep(self.side);
    d3.select(".slider" + targetID.substr(1)).attr("x", self.timeSliderScale(self.timeStep));
  }


  return {
    loadViews,
    update,
    syncTime,
    animationOn
  };

}
