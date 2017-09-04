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

    self.timeStart = App.models.applicationState.getTimeStart(targetID.substr(11));
    self.timeSpan = App.models.applicationState.getTimeSpan(targetID.substr(11));
    self.timeStep = App.models.applicationState.getTimeStep(targetID.substr(11));

    // loadViews();
  }

  function loadViews() {
    stackedDyCommPlots();

    // initialize the brush in the time duration mode
    self.targetSvg.append("g")
      .attr("class", "brush")
      .attr("class", "brush" + targetID.substr(1))
      .call(self.timeBrush)
      // .call(self.timeBrush.move, self.timeScale.range());
      .call(self.timeBrush.move, [self.timeScale(self.timeStart), self.timeScale(self.timeStart + self.timeSpan)])
      .style("display", "none");

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
    // .style("display", "none");
  }

  function stackedDyCommPlots() {

    let x = d3.scaleLinear().domain([0, 100]).range([1, 199]);
    let y = d3.scaleLinear().domain([0, App.models.networkDynamics.getMaxActiveNodes()]).range([28, 2]);

    let area = d3.area()
      .x((d) => x(d.data.time))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    let dyCommData = App.models.networkDynamics.getCommunity_distributions();
    let keys = _.dropRight(Object.keys(dyCommData[0]));
    let stack = d3.stack().keys(keys);

    let layer = self.targetSvg.append("g").selectAll(".layer")
      .data(stack(dyCommData))
      .enter().append("g")
      .attr("class", "layer");

    layer.append("path")
      .attr("class", "area")
      .attr("d", area)
      .style("fill", (d) => App.colorScale[d.key])
      .style("opacity", 0.75);
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
    updateViews();
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
    App.models.applicationState.setTimeStep(targetID.substr(11), self.timeStep);

    // update the image slice view
    updateViews();

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

  function updateViews() {
    if (App.models.applicationState.checkSliceSelected(targetID.substr(11))) {
      App.views["imageSlice" + targetID.substr(11)].updateOverlay();
    }
  }


  function checkSyncTime() {
    let timeSync = App.models.applicationState.getTimeSync();

    if (timeSync) {
      if (_.includes(targetID, "Left")) {
        App.controllers.timeSliderRight.syncTime(self.timeStep, self.timeScale);
      } else if (_.includes(targetID, "Right")) {
        App.controllers.timeSliderLeft.syncTime(self.timeStep, self.timeScale);
      }
    }
  }

  function syncTime(timeStep, timeScale) {
    self.timeStep = timeStep;
    d3.select(".slider" + targetID.substr(1)).attr("x", self.timeSliderScale(self.timeStep));

    App.models.applicationState.setTimeStep(targetID.substr(11), self.timeStep);

    updateViews();
  }

  function animationOn() {
    self.timeStep = App.models.applicationState.getTimeStep(targetID.substr(11));
    d3.select(".slider" + targetID.substr(1)).attr("x", self.timeSliderScale(self.timeStep));
  }


  return {
    loadViews,
    update,
    syncTime,
    animationOn
  };

}
