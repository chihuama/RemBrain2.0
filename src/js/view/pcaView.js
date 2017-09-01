"use strict"

var App = App || {};

let PcaView = function(targetID) {

  let self = {
    targetElement: null,
    targetSvg: null,

    legendElement: null,
    legendSvg: null,

    pcaAnimalDotTip: null,
    pcaRunDotTip: null,
    pcaAxesLabelTip: null,

    data: null,
    projector: null,

    xScale: null,
    yScale: null
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);
    self.legendElement = d3.select(targetID + "-legend");

    self.targetSvg = self.targetElement.append("svg")
      .attr("width", self.targetElement.node().clientWidth)
      .attr("height", self.targetElement.node().clientHeight)
      .attr("viewBox", "0 0 180 130")
      .attr("preserveAspectRatio", "xMidYMid");

    self.legendSvg = self.legendElement.append("svg")
      .attr("width", self.legendElement.node().clientWidth)
      .attr("height", self.legendElement.node().clientHeight)
      .attr("viewBox", "0 0 250 50")
      .attr("preserveAspectRatio", "xMaxYMid");

    drawLegend();
  }

  function drawLegend() {
    self.legendSvg.append("circle")
      .attr("r", 15)
      .attr("cx", 30)
      .attr("cy", 25)
      .style("fill", "pink");

    self.legendSvg.append("text")
      .attr("x", 50)
      .attr("y", 35)
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "28px")
      .text("Old");

    self.legendSvg.append("circle")
      .attr("r", 15)
      .attr("cx", 130)
      .attr("cy", 25)
      .style("fill", "lightblue");

    self.legendSvg.append("text")
      .attr("x", 150)
      .attr("y", 35)
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "28px")
      .text("Young");
  }

  /* get pca data from pca model, and draw pca plot
     will modify this later */

  function pcaPlot(data, projectionMode) {
    self.data = data;

    // get flattened arrays of activations as objects
    let avgActivations = _.map(Object.values(data), mouse => mouse.average);
    let allActivations = _.flatten(
      _.map(Object.values(data), mouse => Object.values(mouse.activations))
    );

    // convert these arrays of objects into vector form
    let avgActivationsMatrix = _.map(avgActivations, App.activationPropertiesToVector);
    let allActivationsMatrix = _.map(allActivations, App.activationPropertiesToVector);

    // create a projection based on each set of vectors
    App.models.averagePCA = new ProjectionModel(avgActivationsMatrix);
    App.models.allPCA = new ProjectionModel(allActivationsMatrix);

    // set a projecction mode for averate or all points
    self.projector = App.models[projectionMode].pcaProject;

    let allProjectedPoints;
    if (projectionMode === "allPCA") { // by run
      allProjectedPoints = self.projector(allActivationsMatrix);
    } else if (projectionMode === "averagePCA") { // by animal
      allProjectedPoints = self.projector(avgActivationsMatrix);
    }

    // calculate the domains of the two principle coordinates
    let pc1Range = d3.extent(allProjectedPoints, tuple => tuple[0]);
    let pc2Range = d3.extent(allProjectedPoints, tuple => tuple[1]);
    // console.log(pc1Range, pc2Range);

    // project the attribute axes on the 2D projection space
    let attrNum = 0;
    for (let attr of Object.keys(App.pcaAttributes)) {
      if (App.pcaAttributes[attr]) {
        attrNum++;
      }
    }

    let xformAxes = _.map(d3.range(attrNum), i => {
      let point = new Array(attrNum).fill(0);
      point[i] = 1;

      return point;
    });
    let projectedAxes = self.projector(xformAxes);

    // calculate the domains of all attributtes
    let axisRangePC1 = d3.extent(projectedAxes, tuple => tuple[0]);
    let axisRangePC2 = d3.extent(projectedAxes, tuple => tuple[1]);
    // console.log(axisRangePC1, axisRangePC2);

    let pc1Min = Math.min(pc1Range[0], axisRangePC1[0]);
    let pc1Max = Math.max(pc1Range[1], axisRangePC1[1]);
    let pc2Min = Math.min(pc2Range[0], axisRangePC2[0]);
    let pc2Max = Math.max(pc2Range[1], axisRangePC2[1]);
    // console.log([pc1Min, pc1Max], [pc2Min, pc2Max]);

    pc1Min = (pc1Min - 0.1).toFixed(1);
    pc1Max = (pc1Max + 0.1).toFixed(1);
    pc2Min = (pc2Min - 0.1).toFixed(1);
    pc2Max = (pc2Max + 0.1).toFixed(1);
    // console.log([pc1Min, pc1Max], [pc2Min, pc2Max]);


    self.xScale = d3.scaleLinear()
      .domain([pc1Min, pc1Max])
      .range([10, 180]);

    self.yScale = d3.scaleLinear()
      .domain([pc2Max, pc2Min])
      .range([5, 120]);

    // tool tips
    creatToolTips();
    self.targetSvg.call(self.pcaAnimalDotTip);
    self.targetSvg.call(self.pcaRunDotTip);
    self.targetSvg.call(self.pcaAxesLabelTip);


    self.targetSvg.selectAll(".avgActivation").remove();
    self.targetSvg.selectAll(".singleActivation").remove();
    self.targetSvg.selectAll(".allMouse").remove();
    self.targetSvg.selectAll(".allActivation").remove();
    self.targetSvg.selectAll(".pcaAxis").remove();
    self.targetSvg.selectAll(".pcaAxislabel").remove();
    self.targetSvg.selectAll(".axisTooltip").remove();

    // dots
    if (projectionMode === "allPCA") { // by run
      // let dots = self.targetSvg.selectAll("g.allMouse")
      self.targetSvg.selectAll("g.allMouse")
        .data(Object.keys(data))
        .enter()
        .append("g")
        .attr("class", "allMouse")
        .attr("id", (d) => d)
        .style("fill", function(d) {
          return _.includes(d, "Old") ? "pink" : "lightblue";
        })
        .each(function(mouse) {
          d3.select(this).selectAll(".allActivation")
            .data(Object.keys(data[mouse].activations))
            .enter()
            .append("circle")
            .datum((activation) => {
              return {
                mouse,
                activation,
                values: data[mouse].activations[activation]
              };
            })
            .attr("class", "allActivation")
            .attr("value", (d) => d)
            .attr("id", (d, i) => d.mouse + "-" + d.activation)
            .each(function(d) {
              // project point from data into the PCA space
              let projectedPoint = self.projector(App.activationPropertiesToVector(d.values));

              d3.select(this)
                .attr("cx", () => self.xScale(projectedPoint[0]))
                .attr("cy", () => self.yScale(projectedPoint[1]));

              // right click a dot to load dynamic community data of that run
              $.contextMenu({
                selector: "#" + d.mouse + "-" + d.activation,
                callback: function(key) {
                  // update activation selector
                  // App.controllers.animalSelector.update(d.mouse);
                  App.controllers.activationSelector.update(d.activation);
                  App.models.applicationState.setSelectedAnimalId(d.mouse);

                  // load data
                  App.models.networkDynamics.loadNetworkDynamics(d.mouse, d.activation)
                    .then(function(data) {
                      // highlight the selected pca dot & the corresponding kiviat diagram
                      d3.select(".selectedDot-" + key).remove();
                      d3.select("#" + d.mouse + "-" + d.activation)
                        .attr("class", "selectedDot-" + key)
                        .style("stroke", App.colorHighlight[key.substr(10)])
                        .style("stroke-width", 1)
                        .select(function() {
                          this.parentNode.appendChild(this);
                        });
                      // d3.selectAll("#" + d.mouse).classed("selectedDot-" + key, false);
                      // d3.select("#" + d.mouse + "-" + d.activation).classed("selectedDot-" + key, true);

                      // tell the imageSliceController which side is loaded
                      App.models.applicationState.loadSliceSelected(key.substr(10));

                      // update imageSlice views
                      App.views[key].update();
                    })
                    .catch(function(err) {
                      console.log("Promise Error", err);
                    });
                },
                items: {
                  "imageSliceLeft": {
                    name: "Load Data on Left"
                  },
                  "imageSliceRight": {
                    name: "Load Data on Right"
                  }
                }
              }); //
            })
            .attr("r", 2)
            .on("mouseover", function(d) {
              this.parentNode.appendChild(this);
              App.controllers.activationSelector.highlight(d.mouse, d.activation);
            })
            .on("mouseout", function(d) {
              App.controllers.activationSelector.reset();
            })
            .on("click", d => {
              console.log(d);
              App.controllers.animalSelector.update(d.mouse);
            });
        });

      let animalId = App.models.applicationState.getSelectedAnimalId();
      if (animalId != null) { // a particular mouse has been selected
        highlightAnimalOf(animalId);
      }
    } else if (projectionMode === "averagePCA") { // by animal
      let dots = self.targetSvg.selectAll(".avgActivation")
        .data(Object.keys(data))
        .enter()
        .append("circle")
        .attr("class", "avgActivation")
        .attr("id", (d) => d)
        .each(function(d) {
          // project point from data into the PCA space
          let projectedPoint = self.projector(App.activationPropertiesToVector(data[d].average));

          d3.select(this)
            .attr("cx", () => self.xScale(projectedPoint[0]))
            .attr("cy", () => self.yScale(projectedPoint[1]));
        })
        .attr("r", 4)
        .style("fill", function(d) {
          return _.includes(d, "Old") ? "pink" : "lightblue";
        })
        // .on("mouseover", self.pcaAnimalDotTip.show)
        // .on("mouseout", self.pcaAnimalDotTip.hide)
        .on("mouseover", function(d) {
          self.pcaAnimalDotTip.show(d);
          App.controllers.animalSelector.highlight(d);
        })
        .on("mouseout", function(d) {
          self.pcaAnimalDotTip.hide(d);
          App.controllers.animalSelector.reset(d);
        })
        .on("click", function(mouse) {
          App.controllers.animalSelector.update(mouse);
        });
    }

    // attribute axes
    let pcaAxes = self.targetSvg.selectAll("line")
      .data(projectedAxes)
      .enter()
      .append("line")
      .attr("class", "pcaAxis")
      .attr("x1", self.xScale(0))
      .attr("y1", self.yScale(0))
      .attr('x2', (d) => self.xScale(d[0]))
      .attr("y2", (d) => self.yScale(d[1]))
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("opacity", 0.5);

    // // attribute axes labels
    // let ind = -1;
    // let pcaAxesLabel = self.targetSvg.selectAll("text")
    //   .data(projectedAxes)
    //   .enter()
    //   .append("text")
    //   .attr("class", "pcaAxislabel")
    //   .attr("x", (d) => self.xScale(d[0]))
    //   .attr("y", (d) => self.yScale(d[1]))
    //   .style("fill", "black")
    //   .style("font-size", "6px")
    //   .style("text-anchor", "middle")
    //   .text(function(d, i) {
    //     ind = _.indexOf(Object.values(App.pcaAttributes), true, ind + 1);
    //     return App.sortingAttributes[ind + 1];
    //   });

    // tool tip circle for each axis
    self.targetSvg.selectAll(".axisTooltip")
      .data(projectedAxes)
      .enter()
      .append("circle")
      .attr("class", "axisTooltip")
      .attr("cx", (d) => self.xScale(d[0]))
      .attr("cy", (d) => self.yScale(d[1]))
      .attr("r", 3)
      .style("fill", "lightgray")
      .style("opacity", 0.2)
      .on("mouseover", self.pcaAxesLabelTip.show)
      .on("mouseout", self.pcaAxesLabelTip.hide);

    // x/y axis
    xyAxis();
    // x/y axis labels
    xyAxisLabels(pc1Min, pc1Max, pc2Min, pc2Max);
  }


  /************************* need to work on this func!!! *************************/
  function selectAnimal(id) {

    let selected = !d3.select("#" + id).classed("selectedAvgActiv");

    d3.selectAll(".avgActivation")
      .classed("selectedAvgActiv", false);

    d3.select("#" + id).classed("selectedAvgActiv", selected);

    // let _this = this;
    let mouse = id;

    if (selected) {
      d3.selectAll(".avgActivation")
        .classed("fadedAvgActiv", true);

      self.targetSvg.selectAll(".singleActivation").remove();

      self.targetSvg.selectAll(".singleActivation")
        .data(Object.keys(self.data[mouse].activations))
        .enter()
        .select(function() {
          // return _this.parentNode.appendChild(_this.cloneNode(true));
          return d3.select("#" + id)["_groups"][0][0].parentNode.appendChild(d3.select("#" + id)["_groups"][0][0].cloneNode(true));
        })
        .attr("class", "singleActivation")
        .attr("id", (d) => "singleActivation-" + d)
        .transition().duration(500)
        .attr("cx", (activation) => {
          let projectedPoint = self.projector(App.activationPropertiesToVector(self.data[mouse].activations[activation]));
          return self.xScale(projectedPoint[0]);
        })
        .attr("cy", (activation) => {
          let projectedPoint = self.projector(App.activationPropertiesToVector(self.data[mouse].activations[activation]));
          return self.yScale(projectedPoint[1]);
        })
        .attr("r", 2)
        .style("stroke", "none")
        .each(function(d) {
          // right click a dot to load dynamic community data of that run
          $.contextMenu({
            selector: "#singleActivation-" + d,
            callback: function(key) {
              // update activation selector
              App.controllers.activationSelector.update(d);
              let animalId = App.models.applicationState.getSelectedAnimalId();
              console.log(mouse); // mouse is the previous one not the current one

              // load data
              App.models.networkDynamics.loadNetworkDynamics(animalId, d)
                .then(function(data) {
                  // highlight the selected pca dot & the corresponding kiviat diagram
                  // d3.select(".selectedDot-" + key).remove();
                  // d3.select("#singleActivation-" + d)
                  //   .attr("class", "selectedDot-" + key)
                  //   .style("stroke", App.colorHighlight[key.substr(10)])
                  //   .style("stroke-width", 1);

                  // tell the imageSliceController which side is loaded
                  App.models.applicationState.loadSliceSelected(key.substr(10));

                  // update imageSlice views
                  App.views[key].update();
                })
                .catch(function(err) {
                  console.log("Promise Error", err);
                });
            },
            items: {
              "imageSliceLeft": {
                name: "Load Data on Left"
              },
              "imageSliceRight": {
                name: "Load Data on Right"
              }
            }
          }); //
        });

      // toolTip
      let toolTip = {};
      _.forEach(App.runs[id], function(value) {
        toolTip["mouse"] = id;
        d3.select("#singleActivation-" + value)
          .on("mouseover", function(d) {
            // console.log(id, d);
            toolTip["activation"] = d;
            self.pcaRunDotTip.show(toolTip);
            this.parentNode.appendChild(this);
            App.controllers.activationSelector.highlight(id, d);
          })
          .on("mouseout", function(d) {
            self.pcaRunDotTip.hide(toolTip);
            App.controllers.activationSelector.reset(d);
          });
      });
    } else {
      d3.selectAll(".avgActivation")
        .classed("fadedAvgActiv", false);

      let avgLocation = self.projector(App.activationPropertiesToVector(self.data[mouse].average));

      d3.selectAll(".singleActivation")
        .transition().duration(500)
        .attr("cx", () => self.xScale(avgLocation[0]))
        .attr("cy", () => self.yScale(avgLocation[1]))
        .transition().delay(500)
        .remove();
    }
  }


  function xyAxis() {
    let xAxis = self.targetSvg.append("line")
      .attr("class", "pcaAxis")
      .attr("x1", 10)
      .attr("y1", 120)
      .attr("x2", 180)
      .attr("y2", 120)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", "0.7");

    let yAxis = self.targetSvg.append("line")
      .attr("class", "pcaAxis")
      .attr("x1", 10)
      .attr("y1", 5)
      .attr("x2", 10)
      .attr("y2", 120)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", "0.7");
  }

  function xyAxisLabels(pc1Min, pc1Max, pc2Min, pc2Max) {
    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 10)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "6px")
      .text(pc1Min);

    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 180)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text(pc1Max);

    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 95)
      .attr("y", 126)
      .style("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "6px")
      .text("PC1");

    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 8)
      .attr("y", 10)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text(pc2Max);

    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 8)
      .attr("y", 120)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text(pc2Min);

    self.targetSvg.append("text")
      .attr("class", "pcaAxislabel")
      .attr("x", 8)
      .attr("y", 65)
      .style("fill", "black")
      .style("text-anchor", "end")
      .style("font-size", "6px")
      .text("PC2");
  }


  function creatToolTips() {
    self.pcaAnimalDotTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d, i) {
        return d;
      });

    self.pcaRunDotTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d) {
        return (d.mouse + ": " + d.activation);
      });

    self.pcaAxesLabelTip = d3.tip()
      .attr("class", "d3-tip")
      .direction("n")
      .html(function(d, i) {
        let selectedAttrInds = App.controllers.pcaAttrSelector.getSelectedAttrInds();
        return App.sortingAttributes[selectedAttrInds[i] + 1];
      });
  }

  /************************* mode: by run *************************/
  function highlightAnimalOf(animalId) {
    d3.selectAll(".allMouse").style("opacity", 0.15);
    d3.selectAll("#" + animalId)
      .style("fill", _.includes(animalId, "Old") ? "pink" : "lightblue")
      .style("opacity", 1);
  }

  function resetHighlightAnimal() {
    _.forEach(Object.keys(App.runs), function(value) {
      d3.selectAll("#" + value)
        .style("fill", _.includes(value, "Old") ? "pink" : "lightblue")
        .style("opacity", 1);
    });
  }

  function highlightActivationOf(activation) {
    self.pcaRunDotTip.show(activation);
    d3.select("#" + activation.mouse + "-" + activation.activation)
      .attr("r", 3)
      .style("stroke", "gray")
      .style("stroke-width", 1)
      .style("z-index", 100);
  }

  function resetHighlightActivationOf(activation) {
    self.pcaRunDotTip.hide(activation);
    d3.select("#" + activation.mouse + "-" + activation.activation)
      .attr("r", 2)
      .style("stroke", "none")
      .style("z-index", -1);
  }
  /**************************************************/


  return {
    pcaPlot,
    selectAnimal,
    highlightAnimalOf,
    resetHighlightAnimal,
    highlightActivationOf,
    resetHighlightActivationOf
  };

}
