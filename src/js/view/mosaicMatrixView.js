"use strict"

var App = App || {};

let MosaicMatrixView = function(targetID) {
  let self = {
    targetElementUp: null,
    targetSvgUp: null,
    targetElementBottom: null,
    targetSvgBottom: null,

    side: null,
    networkDynamics: null,

    overlayMode: {
      "homeComm": 0,
      "tempComm": 1,
      "nodeDegree": 2
    }
    // modeOverlay: null

    // active: {
    //   "Up": false,
    //   "Bottom": false
    // }
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

    self.side = targetID.substr(13);

    // boundary
    self.targetSvgUp.append("rect")
      .attr("class", targetID.substr(1) + "-Up")
      .attr("x", 0)
      .attr("y", 1)
      .attr("width", 98)
      .attr("height", 98)
      .style("fill", "none")
      .style("stroke", App.colorHighlight.Up)
      .style("stroke-width", 1);

    self.targetSvgBottom.append("rect")
      .attr("class", targetID.substr(1) + "-Bottom")
      .attr("x", 0)
      .attr("y", 1)
      .attr("width", 98)
      .attr("height", 98)
      .style("fill", "none")
      .style("stroke", App.colorHighlight.Bottom)
      .style("stroke-width", 1);
  }

  function load() {
    self.networkDynamics = App.models.networkDynamics.getNetworkDynamics();
  }

  function update(direction) {
    let timeStart = App.models.applicationState.getTimeStart(self.side);
    let timeSpan = App.models.applicationState.getTimeSpan(self.side);
    let size = App.models.applicationState.getZoomSize();
    let centerPixelId = App.models.applicationState.getZoomCenter();
    let mode = App.models.applicationState.getOverlayMode();
    let maxNodeDegree = App.models.applicationState.getMaxNodeDegree();

    // color scale for node degrees
    let noDegColorScale = d3.scaleLinear()
      .interpolate(d3.interpolateHcl)
      .domain([0, maxNodeDegree])
      .range(["#deebf7", "#08306b"]);


    let num_x, num_y;
    if (Math.sqrt(timeSpan) - Math.round(Math.sqrt(timeSpan)) >= 0) {
      num_x = Math.ceil(Math.sqrt(timeSpan));
      num_y = Math.floor(Math.sqrt(timeSpan));
    } else {
      num_x = Math.ceil(Math.sqrt(timeSpan));
      num_y = Math.ceil(Math.sqrt(timeSpan));
    }

    let cellSize = 94 / size;
    let subCellSizeX = cellSize / num_x;
    let subCellSizeY = cellSize / num_y;


    d3.selectAll(".singleNodeCell-" + self.side + direction).remove();
    d3.selectAll(".temporalSubCells-" + self.side + direction).remove();


    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let pixelId_x = centerPixelId % 172 + i - Math.floor(size / 2);
        let pixelId_y = Math.floor(centerPixelId / 172) + j - Math.floor(size / 2);
        let pixelId = pixelId_y * 172 + pixelId_x;

        // draw cells for individual nodes
        let cell = self["targetSvg" + direction].append("rect")
          .attr("class", "singleNodeCell-" + self.side + direction)
          .attr("x", 2 + i * cellSize)
          .attr("y", 3 + j * cellSize)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .style("fill", "lightgray")
          .style("stroke", "white")
          .style("stroke-width", 1);

        // draw sub-cells to show temporal features
        for (let t = 0; t < timeSpan; t++) {
          self["targetSvg" + direction].append("rect")
            .attr("class", "temporalSubCells-" + self.side + direction)
            .attr("x", 2 + i * cellSize + (t % num_x) * subCellSizeX)
            .attr("y", 3 + j * cellSize + Math.floor(t / num_x) * subCellSizeY)
            .attr("width", subCellSizeX)
            .attr("height", subCellSizeY)
            .style("fill", function() {
              if (self.networkDynamics[timeStart + t][pixelId]) { // check if the node is active
                // return App.colorScale[self.networkDynamics[timeStart + t][pixelId][0]];
                if (mode === "nodeDegree") { // Node Degree
                  return noDegColorScale(self.networkDynamics[timeStart + t][pixelId][self.overlayMode[mode]]);
                } else { // Home/Temporary Community
                  return App.colorScale[self.networkDynamics[timeStart + t][pixelId][self.overlayMode[mode]]];
                }
              } else {
                return "lightgray";
              }
            })
            .style("stroke", "none");
        }
      }
    }

    inactive(direction);
  }

  function inactive(direction) {
    d3.select(".inactive-" + self.side + direction).remove();

    self["targetSvg" + direction].append("rect")
      .attr("class", "inactive-" + self.side + direction)
      .attr("x", 1)
      .attr("y", 2)
      .attr("width", 96)
      .attr("height", 96)
      .style("fill", "black")
      .style("opacity", 0.5)
      .style("stroke", "none")
      .style("display", "none");
  }


  return {
    load,
    update
  };

}
