"use strict"

var App = App || {};

let PcaView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    pcaDotTip: null,
    pcaAxesLabelTip: null
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);
    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 180 130")
      .attr("preserveAspectRatio", "xMidYMid");
  }

  /* get pca data from pca model, and draw pca plot
     will modify this later */
  function pcaPlot(pcaData) {
    let pc1 = pcaData.map(function(tuple) {
      return tuple[0];
    });
    let pc2 = pcaData.map(function(tuple) {
      return tuple[1];
    });

    let pc1Range = d3.extent(pc1);
    let pc2Range = d3.extent(pc2);
    console.log(pc1Range);
    console.log(pc2Range);
    /******************************/

    let xformAxes = _.map(d3.range(10), i => {
      let point = new Array(10).fill(0);
      point[i] = 1;

      return point;
    });

    console.log(xformAxes);

    let projectedAxes = App.models.pca.applyExistingPCA(xformAxes);
    console.log(projectedAxes);

    let xScale = d3.scaleLinear()
      .domain([-1.4, 0.2])
      .range([10, 180]);

    let yScale = d3.scaleLinear()
      .domain([0.5, -0.6])
      .range([5, 120]);

    let xAxis = self.targetSvg.append("line")
      .attr("x1", 10)
      .attr("y1", 120)
      .attr("x2", 180)
      .attr("y2", 120)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", "0.7");

    let yAxis = self.targetSvg.append("line")
      .attr("x1", 10)
      .attr("y1", 5)
      .attr("x2", 10)
      .attr("y2", 120)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", "0.7");

    // tool tips
    creatToolTips();

    self.targetSvg.call(pcaDotTip);

    let dots = self.targetSvg.selectAll("circle")
      .data(pcaData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 2)
      .style("fill", function(d, i) {
        if (i < 5) {
          return "pink"; // aged
        } else {
          return "lightblue"; // young
        }
      })
      .on("mouseover", self.pcaDotTip.show)
      .on("mouseout", self.pcaDotTip.hide);

    let pcaAxes = self.targetSvg.selectAll("line")
      .data(projectedAxes)
      .enter()
      .append("line")
      .attr("x1", xScale(0))
      .attr("y1", yScale(0))
      .attr('x2', (d) => xScale(d[0]))
      .attr("y2", (d) => yScale(d[1]))
      .style("stroke", "gray")
      .style("stroke-width", 1)
      .style("opacity", 0.5);

    let pcaAxesLabel = self.targetSvg.selectAll("text")
      .data(projectedAxes)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d[1]))
      .style("fill", "black")
      .style("font-size", "8px")
      .style("text-anchor", "middle")
      .text(function(d, i) {
        return i;
      });
  }


  function creatToolTips() {
    self.pcaDotTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d, i) {
        return Object.keys(App.runs)[i];
      })
  }


  return {
    pcaPlot
  };

}
