"use strict"

var App = App || {};

let KiviatSummaryView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    legendElement: null,
    legendSvg: null,

    attributes: [],
    attributeScales: {},
    colorScale: {},

    axisTip: null,
    centerTip: null,

    sortInd: {},
    selection: {},
    animalSortInd: {},

    mode: "avg" // or "all"
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);
    self.legendElement = d3.select(targetID + "-colorLegend");

    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 500 200")
      .attr("preserveAspectRatio", "xMidYMid");

    self.legendSvg = self.legendElement.append("svg")
      .attr("width", self.legendElement.node().clientWidth)
      .attr("height", self.legendElement.node().clientHeight)
      .attr("viewBox", "0 0 600 60")
      .attr("preserveAspectRatio", "xMaxYMid");
    // .style("background", "pink");
  }

  function create(networkMetrics) {
    /* networkMetrics data structure:
      {"Old36": { activations: {"a1": {}, "a2": {}, ...,}, "average": {}, "runMin": {}, "runMax": {}},
       "Old38": {}, ..., "Young40": {}} */

    // get attributes from networkMetricsModel
    self.attributes = App.models.networkMetrics.getMetricsAttributes();
    // self.attributes = App.sortingAttributes;
    // self.attributes.shift();

    for (let attribute of self.attributes) {
      let attributeExtent = App.models.networkMetrics.getAttributesRange()[attribute];

      self.attributeScales[attribute] = d3.scaleLinear()
        .domain(attributeExtent)
        .range([5, 35]);
    }

    // get the range of networks size
    let extent = App.models.networkMetrics.getNetworksSizeRange();

    self.colorScale = d3.scaleLinear()
      .interpolate(d3.interpolateHcl)
      .domain(extent)
      .range(["#d18161", "#70a4c2"]);

    drawLegend(extent);

    // draw kiviats for each animal
    for (let network of Object.keys(networkMetrics).sort()) {
      let networkInd = Object.keys(networkMetrics).sort().indexOf(network);

      // initialize sortInd and selection
      self.sortInd[networkInd] = networkInd;
      self.selection[networkInd] = false;

      // draw the kiviat diagram of the run avg of this animal
      update("kiviatAvg", networkInd, network, networkMetrics[network].average);
    }
  }

  function drawLegend(domain) {
    // create the svg:defs element and the main gradient definition
    let svgDefs = self.legendSvg.append("defs");
    let legendGradient = svgDefs.append("linearGradient")
      .attr("id", "legendGradient");

    // create the stops of the main gradient
    legendGradient.append("stop")
      .attr("class", "stop-left")
      .attr("offset", "0");

    legendGradient.append("stop")
      .attr("class", "stop-middle")
      .attr("offset", "0.5");

    legendGradient.append("stop")
      .attr("class", "stop-right")
      .attr("offset", "1");

    // horizontal gradient
    legendGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    self.legendSvg.append("rect")
      .classed("filled", true)
      .attr("x", 100)
      .attr("y", 20)
      .attr("width", 400)
      .attr("height", 30)
      .style("opacity", 0.75);

    // min value
    self.legendSvg.append("text")
      .attr("x", 95)
      .attr("y", 40)
      .style("font-size", "18px")
      .style("text-anchor", "end")
      .text(domain[0].toFixed(2));

    // max value
    self.legendSvg.append("text")
      .attr("x", 505)
      .attr("y", 40)
      .style("font-size", "18px")
      .style("text-anchor", "start")
      .text(domain[1].toFixed(2));

    // title
    self.legendSvg.append("text")
      .attr("x", 300)
      .attr("y", 15)
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("# of active pixels");
  }

  function update(type, Ind, label, networkMetricsAtInd) {

    creatToolTips();

    self.targetSvg.call(self.axisTip);
    self.targetSvg.call(self.centerTip);

    let translateGroup = self.targetSvg.append("g")
      // .attr("class", type)
      .attr("id", type + "-" + Ind)
      .attr("transform", "translate(" + (50 + 100 * (Ind % 5)) + "," + (50 + 100 * Math.floor(Ind / 5)) + ")")
      .attr("class", type + "-translateGroup")
      .style("opacity", 0);

    let axesGroup = translateGroup.append("g")
      .attr("calss", "axesGroup");

    let pathGroup = translateGroup.append("path")
      .attr("class", "kiviatPath");

    // tool tip circle in the center to show the network size
    translateGroup.append("circle")
      .attr("class", "centerTooltipCircle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8)
      .style("opacity", 0.05)
      .datum({
        "attr": "# of active pixels",
        "val": (networkMetricsAtInd.size).toFixed(0)
      })
      .on('mouseover', self.centerTip.show)
      .on('mouseout', self.centerTip.hide);

    // draw axes
    for (let i = 0; i < self.attributes.length; i++) {
      let axisEndpoint = rotatePointOntoAxis(40, i);

      axesGroup.append("line")
        .attr("class", "axisLine")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", axisEndpoint.x)
        .attr("y2", axisEndpoint.y)
        .style("stroke", "darkgray")
        .style("stroke-width", "1px");

      // axis label
      axesGroup.append("text")
        .attr("x", axisEndpoint.x)
        .attr("y", axisEndpoint.y + 2)
        .style("font-size", "6px")
        .style("text-anchor", "middle")
        .text(i);

      // tool tip circle for each axis
      axesGroup.append("circle")
        .attr("class", "axisTooltipCircle")
        .attr("id", "attributeInd-" + i)
        .attr("cx", axisEndpoint.x)
        .attr("cy", axisEndpoint.y)
        .attr("r", 5)
        .style("opacity", 0.25)
        .datum({
          "attr": self.attributes[i],
          "val": (networkMetricsAtInd[self.attributes[i]]).toFixed(3)
        })
        .on('mouseover', self.axisTip.show)
        .on('mouseout', self.axisTip.hide);
    }

    // draw path
    pathGroup.datum(networkMetricsAtInd)
      .attr("d", calculatePath)
      .style("fill", d => self.colorScale(d.size))
      .style("opacity", 0.75);

    // run name
    translateGroup.append("text")
      .attr("class", "networkInd")
      .attr("x", -48)
      .attr("y", -42)
      .style("font-size", "6px")
      .text(label);

    translateGroup.transition().delay(500)
      .style("opacity", 1);

    /* click on an animal to display all runs of that animal */
    if (type == "kiviatAvg") {
      translateGroup.on("click", function() {
        selectAnimal(Ind);
      });
    }

  }

  function selectAnimal(Ind) {
    self.selection[Ind] = !self.selection[Ind];

    d3.select(".highlight").remove();
    d3.selectAll(".kiviatAll-translateGroup").remove();

    setTimeout(function() {
      if (self.selection[Ind]) {
        self.mode = "all";
        highlightKiviat(Ind);
        shrinkAvgKiviats();

        // update kiviat selector controller
        App.controllers.kiviatSelector.update(Ind);

        // set rest selections to false
        _.forEach(self.selection, function(value, key) {
          if (key != Ind) {
            self.selection[key] = false;
          }
        });
      } else {
        self.mode = "avg";

        // reset to origianl views
        sortAvgKiviats();
      }
    }, 0)
  }

  /* calculate the path */
  function calculatePath(d) {
    let pathCoord = [];

    for (let attributeInd in self.attributes) {
      let attribute = self.attributes[attributeInd];

      let xPoint = self.attributeScales[attribute](d[attribute]);

      let endpoint = rotatePointOntoAxis(xPoint, attributeInd);

      pathCoord.push(endpoint.x + " " + endpoint.y);
    }

    return "M " + pathCoord.join(" L ") + " Z";
  }

  /* get the coordinates of the point on each axis */
  function rotatePointOntoAxis(pointX, axisIndex) {
    let angle = Math.PI * 2 * axisIndex / Object.keys(self.attributeScales).length;
    return rotatePoint(pointX, angle);
  }

  function rotatePoint(pointX, angle) {
    return {
      x: Math.cos(angle) * (pointX),
      y: Math.sin(angle) * (pointX)
    };
  }

  /* create tooltips for kiviats to show actual values of each attribute */
  function creatToolTips() {
    self.axisTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d) {
        return d.attr + ": " + d.val;
      });

    self.centerTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d) {
        return d.attr + ": " + d.val;
        // return "ID: " + d.ID + "<br>Age: " + d.AgeAtTx + "<br>5y Sur. Pb.: " + d["Probability of Survival"];
      });
  }

  /* update sortInd */
  function updateSortInd(avgSortInd, animalSortInd) {
    self.sortInd = avgSortInd;
    self.animalSortInd = animalSortInd;

    sortAvgKiviats();
  }

  /* sort kiviats */
  function sortAvgKiviats() {
    _.forEach(self.sortInd, function(value, key) {
      d3.select("#kiviatAvg-" + key).transition().duration(500)
        .attr("transform", "translate(" + (50 + 100 * (value % 5)) + "," + (50 + 100 * Math.floor(value / 5)) + ")")
    });

    // check the mode
    if (self.mode === "all") {
      shrinkAvgKiviats();
      sortAllKiviatsOf();
    }
  }

  function sortAllKiviatsOf() {
    _.forEach(self.animalSortInd, function(value, key) {
      if (Object.keys(self.animalSortInd).length <= 10) { // 2 rows
        d3.select("#kiviatAll-" + key)
          .attr("transform", "translate(" + (140 + 80 * (value % 5)) + "," +
            (40 + 80 * Math.floor(value / 5)) + ") scale(0.8, 0.8)");
      } else { // 3 rows
        d3.select("#kiviatAll-" + key)
          .attr("transform", "translate(" + (140 + 66 * (value % 5)) + "," +
            (33 + 66 * Math.floor(value / 5)) + ") scale(0.66, 0.66)");
      }
    });
  }

  /* shrink kiviats */
  function shrinkAvgKiviats() {
    _.forEach(self.sortInd, function(value, key) {
      d3.select("#kiviatAvg-" + key).transition().duration(500)
        .attr("transform", "translate(" + (20 + 40 * Math.floor(value / 5)) + "," +
          (20 + 40 * (value % 5)) + ") scale(0.4, 0.4)");
    });
  }

  /* highlight the selected kiviat */
  function highlightKiviat(animalInd) {
    d3.select("#kiviatAvg-" + animalInd).append("g")
      .attr("class", "highlight")
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 35)
      .style("opacity", 0.4);
  }

  /* update kiviats from the same animal */
  function updateAnimal(animal) {
    // animal Object includes all runs of that animal
    let runs = Object.keys(animal.activations);
    // let runs = _.filter(Object.keys(animal), function(o) {
    //   return (o != "runAvg" && o != "runMin" && o != "runMax");
    // });

    for (let runInd in runs) {
      update("kiviatAll", runInd, runs[runInd], animal.activations[runs[runInd]]);

      // translate and scale
      if (runs.length <= 10) { // 2 rows
        d3.select("#kiviatAll-" + runInd)
          .attr("transform", "translate(" + (140 + 80 * (runInd % 5)) + "," +
            (40 + 80 * Math.floor(runInd / 5)) + ") scale(0.8, 0.8)");
      } else { // 3 rows
        d3.select("#kiviatAll-" + runInd)
          .attr("transform", "translate(" + (140 + 66 * (runInd % 5)) + "," +
            (33 + 66 * Math.floor(runInd / 5)) + ") scale(0.66, 0.66)");
      }
    }

  }

  /* highlight the axis of the selected attribute */
  function highlightAxis(attr) {
    _.forEach(self.attributes, function(value, i) {
      d3.selectAll("#attributeInd-" + i).style("fill", "lightgray");
    });

    let attrInd = self.attributes.indexOf(attr);

    d3.selectAll("#attributeInd-" + attrInd).style("fill", "red");
  }


  return {
    create,
    update,
    updateSortInd,
    updateAnimal,
    highlightAxis,
    selectAnimal
  };

}
