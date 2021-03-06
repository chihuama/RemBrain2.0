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

    selection: {},
    animalSortInd: {},
    activationSortInd: {},

    mode: "avg", // or "all"

    loadingOn: {
      "Left": {
        "mouse": null,
        "activation": null
      },
      "Right": {
        "mouse": null,
        "activation": null
      }
    }

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
  }

  function create(networkMetrics) {
    /* networkMetrics data structure:
      {"Old36": { activations: {"a1": {}, "a2": {}, ...,}, "average": {}, "runMin": {}, "runMax": {}},
       "Old38": {}, ..., "Young40": {}} */

    // get attributes from networkMetricsModel
    self.attributes = App.models.networkMetrics.getMetricsAttributes();

    for (let attribute of self.attributes) {
      let attributeExtent = App.models.networkMetrics.getAttributesRange()[attribute];

      self.attributeScales[attribute] = d3.scaleLinear()
        .domain(attributeExtent)
        .range([5, 35]);
    }

    // get the range of networks size
    let extent = App.models.networkMetrics.getNetworksSizeRange();
    console.log(extent);

    self.colorScale = d3.scaleLinear()
      .interpolate(d3.interpolateHcl)
      .domain(extent)
      .range(["#d18161", "#70a4c2"]);

    drawLegend(extent);

    // draw kiviats for each animal
    for (let animalId of Object.keys(networkMetrics).sort()) {
      // initialize selection and animalSortInd
      self.selection[animalId] = false;
      self.animalSortInd[animalId] = Object.keys(networkMetrics).sort().indexOf(animalId);

      // draw the kiviat diagram of the run avg of this animal
      drawKiviat("kiviatAvg", animalId, self.animalSortInd[animalId], networkMetrics[animalId].average);
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

  /* draw an individual kiviat diagram */
  function drawKiviat(mode, animalId, Ind, animalIdNetworkMetrics) {
    creatToolTips();

    self.targetSvg.call(self.axisTip);
    self.targetSvg.call(self.centerTip);

    let translateGroup = self.targetSvg.append("g")
      .attr("id", mode + "-" + animalId)
      .attr("transform", "translate(" + (50 + 100 * (Ind % 5)) + "," + (50 + 100 * Math.floor(Ind / 5)) + ")")
      .attr("class", mode + "-translateGroup")
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
      .attr("r", 10)
      .style("opacity", 0.05)
      .datum({
        "attr": "# of active pixels",
        "val": (animalIdNetworkMetrics.size).toFixed(0)
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
          "val": (animalIdNetworkMetrics[self.attributes[i]]).toFixed(3)
        })
        .on('mouseover', self.axisTip.show)
        .on('mouseout', self.axisTip.hide);
    }

    // draw path
    pathGroup.datum(animalIdNetworkMetrics)
      .attr("d", calculatePath)
      .style("fill", d => self.colorScale(d.size))
      .style("opacity", 0.75);

    // run name
    if (mode === "kiviatAvg") {
      translateGroup.append("rect")
        .attr("x", -50)
        .attr("y", -48)
        .attr("width", animalId.length * 4)
        .attr("height", 9)
        .style("fill", function() {
          return _.includes(animalId, "Old") ? "pink" : "lightblue";
        })
        .style("stroke", "none");
    }

    translateGroup.append("text")
      .attr("class", "networkInd")
      .attr("x", -48)
      .attr("y", -42)
      .style("font-size", "6px")
      .text(animalId);

    translateGroup.transition().delay(500)
      .style("opacity", 1);

    /* click on an animal to display all runs of that animal */
    if (mode == "kiviatAvg") {
      translateGroup
        .on("mouseover", function() {
          App.controllers.animalSelector.highlight(animalId);
        })
        .on("mouseout", function() {
          App.controllers.animalSelector.reset(animalId);
        })
        .on("click", function() {
          App.controllers.animalSelector.update(animalId); // to call selectAnimal();
        });

      // right click a kiviat to select an animal as the target
      $.contextMenu({
        selector: "#kiviatAvg-" + animalId,
        callback: function(key) {
          if (App.models.applicationState.getSimilarityMode()) {
            // update the sorting
            if (self.mode == "all") {
              App.controllers.animalSelector.update(animalId); // to call selectAnimal();
            } else {
              App.controllers.kiviatSorting.sortAccordingTo(animalId);
            }
          }
        },
        items: {
          "similarityTarget": {
            name: "Select"
          }
        }
      });
    }
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
      });
  }

  /* click on a kiviat to select an animal */
  function selectAnimal(animalId) {
    self.selection[animalId] = !self.selection[animalId];

    d3.select(".highlight-kiviatAvg").remove();
    _.forEach(Object.keys(App.runs), function(value) {
      d3.select(".highlight-" + value).remove();
    });
    d3.selectAll(".kiviatAll-translateGroup").remove();

    // get networkMetrics
    let networkMetrics = App.models.networkMetrics.getNetworkMetrics();

    // update the application state
    if (self.selection[animalId]) {
      App.models.applicationState.setSelectedAnimalId(animalId);
      App.models.applicationState.setSelectedAnimal(networkMetrics[animalId]);
    } else {
      App.models.applicationState.setSelectedAnimalId(null);
      App.models.applicationState.setSelectedAnimal(null);
    }

    setTimeout(function() {
      if (self.selection[animalId]) {
        self.mode = "all";
        // highlight the selected animal
        // highlightKiviat("kiviatAvg", animalId);
        d3.select("#kiviatAvg-" + animalId).append("g")
          .attr("class", "highlight-" + animalId)
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 35)
          .style("opacity", 0.4)
          .style("pointer-events", "none");

        // update the kiviat summary view
        updateAnimal(networkMetrics[animalId]);

        // update controllers
        if (App.models.applicationState.getSimilarityMode()) {
          App.controllers.kiviatSorting.sortAccordingTo(animalId);
        } else {
          App.controllers.kiviatSorting.updateSelectedAttribute();
        }

        // set rest selections to false
        _.forEach(self.selection, function(value, key) {
          if (key != animalId) {
            self.selection[key] = false;
          }
        });

        _.forEach(Object.keys(self.loadingOn), function(side) {
          if (self.loadingOn[side].mouse == animalId) {
            highlightLoadedActivation(side);
          }
        });

      } else {
        // reset to origianl views
        self.mode = "avg";
        sortAvgKiviats();
      }
    }, 0)

  }


  /* update sortInd */
  function updateSortInd(animalSortInd, activationSortInd) {
    self.animalSortInd = animalSortInd;
    self.activationSortInd = activationSortInd;

    sortAvgKiviats();
  }

  /* sort kiviats */
  function sortAvgKiviats() {
    _.forEach(self.animalSortInd, function(value, key) {
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
    _.forEach(self.activationSortInd, function(value, key) {
      if (Object.keys(self.activationSortInd).length <= 10) { // 2 rows
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
    _.forEach(self.animalSortInd, function(value, key) {
      d3.select("#kiviatAvg-" + key).transition().duration(500)
        .attr("transform", "translate(" + (20 + 40 * Math.floor(value / 5)) + "," +
          (20 + 40 * (value % 5)) + ") scale(0.4, 0.4)");
    });
  }


  /* update kiviats from the same animal */
  function updateAnimal(animal) {
    // animal Object includes all runs of that animal
    let runs = Object.keys(animal.activations);

    for (let runInd in runs) {
      drawKiviat("kiviatAll", runs[runInd], runInd, animal.activations[runs[runInd]]);

      // translate and scale
      if (runs.length <= 10) { // 2 rows
        d3.select("#kiviatAll-" + runs[runInd])
          .attr("transform", "translate(" + (140 + 80 * (runInd % 5)) + "," +
            (40 + 80 * Math.floor(runInd / 5)) + ") scale(0.8, 0.8)");
      } else { // 3 rows
        d3.select("#kiviatAll-" + runs[runInd])
          .attr("transform", "translate(" + (140 + 66 * (runInd % 5)) + "," +
            (33 + 66 * Math.floor(runInd / 5)) + ") scale(0.66, 0.66)");
      }

      // mouseover to highligt the activation
      d3.select("#kiviatAll-" + runs[runInd])
        .on("mouseover", function() {
          let animalId = App.models.applicationState.getSelectedAnimalId();
          App.controllers.activationSelector.highlight(animalId, runs[runInd]);
        })
        .on("mouseout", function() {
          App.controllers.activationSelector.reset(runs[runInd]);
        });

      // right click a kiviat to load dynamic community data of that run
      $.contextMenu({
        selector: "#kiviatAll-" + runs[runInd],
        callback: function(key) {
          let animalId = App.models.applicationState.getSelectedAnimalId();

          // update activation selector
          App.controllers.activationSelector.update(runs[runInd]);

          // update the data info loaded on the [key] side
          self.loadingOn[key].mouse = animalId;
          self.loadingOn[key].activation = runs[runInd];
          console.log(self.loadingOn[key]);

          // highlight the selected kiviat
          highlightLoadedActivation(key);

          // load data
          App.models.networkDynamics.loadNetworkDynamics(animalId, runs[runInd])
            .then(function(data) {
              // console.log("dynamics: ", data);
              // highlight the selected kiviat & the corresponding pca dot
              // ...

              // tell the imageSliceController which side is loaded
              App.models.applicationState.loadSliceSelected(key);

              // update the time slider controller
              App.controllers["timeSlider" + key].loadViews();

              // update the image slice view
              App.views["imageSlice" + key].update();

              // update the mosaic matrix view
              App.views["mosaicMatrix" + key].load();
            })
            .catch(function(err) {
              console.log("Promise Error", err);
            });
        },
        items: {
          "Left": {
            name: "Load Data on Left"
          },
          "Right": {
            name: "Load Data on Right"
          }
        }
      });

    }
  }

  /* highlight the selected kiviat */
  function highlightKiviat(mode, Id) {
    d3.select("#" + mode + "-" + Id).append("g")
      .attr("class", "highlight-" + mode)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 35)
      .style("opacity", 0.4)
      .style("pointer-events", "none");
  }

  /* highlight the axis of the selected attribute */
  function highlightAxis(attr) {
    _.forEach(self.attributes, function(value, i) {
      d3.selectAll("#attributeInd-" + i).style("fill", "lightgray");
    });

    let attrInd = self.attributes.indexOf(attr);

    d3.selectAll("#attributeInd-" + attrInd).style("fill", "red");
  }

  /* highlight the kiviat of mouse-activation loaded in the brain slice view */
  function highlightLoadedActivation(side) {
    d3.select(".selectedRun-" + side).remove();
    d3.select("#kiviatAll-" + self.loadingOn[side].activation).append("g")
      .attr("class", "selectedRun-" + side)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 35)
      .style("fill", App.colorHighlight[side])
      .style("opacity", 0.3);

    highlightLoadedMouse(side);
  }

  function highlightLoadedMouse(side) {
    d3.select(".selectedAnimal-" + side).remove();
    d3.select("#kiviatAvg-" + self.loadingOn[side].mouse).append("g")
      .attr("class", "selectedAnimal-" + side)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 35)
      .style("fill", App.colorHighlight[side])
      .style("opacity", 0.3);
  }

  /* highlight the selected mouse to sort the rest mice based on their similarity scores */
  function highlightSelectedMouse(mode, Id) {
    d3.select(".select-" + mode).remove();
    d3.select("#" + mode + "-" + Id).append("g")
      .attr("class", "select-" + mode)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 35)
      .style("opacity", 0.3)
      .style("pointer-events", "none");

    _.forEach(self.attributes, function(value, i) {
      d3.selectAll("#attributeInd-" + i).style("fill", "lightgray");
    });
  }


  return {
    create,
    selectAnimal,
    updateSortInd,
    highlightAxis,
    highlightKiviat,
    highlightSelectedMouse
  };

}
