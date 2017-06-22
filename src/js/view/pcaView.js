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
  function pcaPlot(data, projector) {
    let avgActivations = _.map(Object.values(data), mouse => mouse.average);
    let allActivations = _.flatten(
      _.map(Object.values(data), mouse => Object.values(mouse.activations))
    );

    let avgActivationsMatrix = _.map(avgActivations, App.activationPropertiesToVector);
    let allActivationsMatrix = _.map(allActivations, App.activationPropertiesToVector);

    // let allProjectedPoints = projector(_.concat(avgActivationsMatrix, allActivationsMatrix));
    let allProjectedPoints = projector(avgActivationsMatrix);

    // calculate the domains of the two principle coordinates
    let pc1Range = d3.extent(allProjectedPoints, tuple => tuple[0]);
    let pc2Range = d3.extent(allProjectedPoints, tuple => tuple[1])
    console.log(pc1Range);
    console.log(pc2Range);
    /******************************/

    let xformAxes = _.map(d3.range(10), i => {
      let point = new Array(10).fill(0);
      point[i] = 1;

      return point;
    });

    console.log(xformAxes);

    let projectedAxes = App.models.averagePCA.pcaProject(xformAxes);

    let xScale = d3.scaleLinear()
      .domain([-1.4, 0.2])
      // .domain(pc1Range)
      .range([10, 180]);

    let yScale = d3.scaleLinear()
      .domain([0.5, -0.6])
      // .domain(pc2Range)
      .range([5, 120]);


    // tool tips
    creatToolTips();
    self.targetSvg.call(self.pcaDotTip);
    self.targetSvg.call(self.pcaAxesLabelTip);


    let dots = self.targetSvg.selectAll(".avgActivation")
      .data(Object.keys(data))
      .enter()
      .append("circle")
      .attr("class", "avgActivation")
      .each(function(d) {
        // project point from data into the PCA space
        let projectedPoint = projector(App.activationPropertiesToVector(data[d].average));

        d3.select(this)
          .attr("cx", () => xScale(projectedPoint[0]))
          .attr("cy", () => yScale(projectedPoint[1]));
      })
      .attr("r", 2)
      .style("fill", function(d) {
        return _.includes(d, "Old") ? "pink" : "lightblue";
      })
      .on("mouseover", self.pcaDotTip.show)
      .on("mouseout", self.pcaDotTip.hide)
      .on("click", function(mouse) {
        let selected = !d3.select(this).classed("selectedAvgActiv");

        d3.selectAll(".avgActivation")
          .classed("selectedAvgActiv", false);

        d3.select(this).classed("selectedAvgActiv", selected);

        let _this = this;

        if (selected) {
          d3.selectAll(".avgActivation")
            .classed("fadedAvgActiv", true);

          self.targetSvg.selectAll(".singleActivation").remove();

          self.targetSvg.selectAll(".singleActivation")
            .data(Object.keys(data[mouse].activations))
            .enter()
            .select(function() {
              return _this.parentNode.appendChild(_this.cloneNode(true));
            })
            .attr("r", 1)
            .attr("class", "singleActivation")
            .transition().duration(500)
            .attr("cx", (activation) => {
              let projectedPoint = projector(App.activationPropertiesToVector(data[mouse].activations[activation]));
              return xScale(projectedPoint[0]);
            })
            .attr("cy", (activation) => {
              let projectedPoint = projector(App.activationPropertiesToVector(data[mouse].activations[activation]));
              return yScale(projectedPoint[1]);
            });

        } else {
          d3.selectAll(".avgActivation")
            .classed("fadedAvgActiv", false);

          let avgLocation = projector(App.activationPropertiesToVector(data[mouse].average));

          d3.selectAll(".singleActivation")
            .transition().duration(500)
            .attr("cx", () => xScale(avgLocation[0]))
            .attr("cy", () => yScale(avgLocation[1]))
            .transition().delay(500)
            .remove();
        }
      });

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

    // axis label
    let pcaAxesLabel = self.targetSvg.selectAll("text")
      .data(projectedAxes)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d[1]))
      .style("fill", "black")
      .style("font-size", "6px")
      .style("text-anchor", "middle")
      .text(function(d, i) {
        // return i;
        return App.sortingAttributes[i + 1];
      });

    // tool tip circle for each axis
    self.targetSvg.selectAll(".axisTooltip")
      .data(projectedAxes)
      .enter()
      .append("circle")
      .attr("class", "axisTooltip")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 10)
      .style("fill", "lightgray")
      .style("opacity", 0.2)
      .on("mouseover", self.pcaAxesLabelTip.show)
      .on("mouseout", self.pcaAxesLabelTip.hide);

    // x/y axis
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

    // label
    self.targetSvg.append("text")
      .attr("x", 10)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "6px")
      .text("-1.4");

    self.targetSvg.append("text")
      .attr("x", 180)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text("0.2");

    self.targetSvg.append("text")
      .attr("x", 95)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "6px")
      .text("PC1");

    self.targetSvg.append("text")
      .attr("x", 8)
      .attr("y", 10)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text("0.5");

    self.targetSvg.append("text")
      .attr("x", 8)
      .attr("y", 120)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text("-0.6");

    self.targetSvg.append("text")
      .attr("x", 8)
      .attr("y", 65)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text("PC2");
  }


  function creatToolTips() {
    self.pcaDotTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d, i) {
        return d;
      })

    self.pcaAxesLabelTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d, i) {
        return App.sortingAttributes[i + 1];
      });
  }


  return {
    pcaPlot
  };

}
