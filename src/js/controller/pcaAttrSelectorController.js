"use strict"

var App = App || {};

let PcaAttrSelectorController = function(listID) {
  let self = {
    list: null,
    attributes: null,
    checkboxStates: {}
  };

  init();

  function init() {
    // let attributes = _.drop(App.sortingAttributes);
    self.attributes = Object.keys(App.pcaAttributes);

    for (let attribute of self.attributes) {
      self.checkboxStates[attribute] = true;
    }
    // self.checkboxStates["selectAll"] = false;

    self.list = d3.select(listID);

    self.list.selectAll(".checkbox-li")
      .data(self.attributes)
      .enter().append("li")
      .attr("class", "checkbox-li")
      .each(function(d, i) {
        let div = d3.select(this).append("div").attr("class", "checkbox");

        div.append("input")
          .attr("class", "separated-checkbox")
          .attr("checked", true)
          .attr("type", "checkbox")
          .attr("value", d)
          // .attr("id", "pcaAttrCheck" + d)
          .attr("id", "pcaAttrCheck-" + i)
          .on("click", checkboxOnChange);

        div.append("label")
          .attr("for", "pcaAttrCheck-" + i)
          .text(d);
      });

    // select all
    let selectAllDiv = self.list.append("li")
      .attr("class", "checkbox-li")
      .append("div")
      .attr("class", "checkbox");

    selectAllDiv.append("input")
      .attr("class", "separated-checkbox")
      .attr("checked", true)
      .attr("type", "checkbox")
      .attr("value", "selectAll")
      .attr("id", "pcaAttrCheck-selectAll")
      .on("click", checkAllOnChange);

    selectAllDiv.append("label")
      .attr("for", "pcaAttrCheck" + "-selectAll")
      .text("Select All");
  }

  function checkboxOnChange() {
    let checkbox = d3.select(this).node();

    self.checkboxStates[checkbox.value] = checkbox.checked;

    if (Object.values(self.checkboxStates).indexOf(false) == -1) {
      d3.select("#pcaAttrCheck-selectAll").node().checked = true;
    } else {
      d3.select("#pcaAttrCheck-selectAll").node().checked = null;
    }

    App.pcaAttributes[checkbox.value] = checkbox.checked;

    updateViews();
  }

  function checkAllOnChange() {
    let checkbox = d3.select(this).node();

    if (checkbox.checked == true) {
      for (let attributeInd in self.attributes) {
        self.checkboxStates[self.attributes[attributeInd]] = true;
        d3.select("#pcaAttrCheck-" + attributeInd).node().checked = true;
        App.pcaAttributes[self.attributes[attributeInd]] = true;
      }
      updateViews();
    }
  }

  function updateViews() {
    let data = App.models.networkMetrics.getNetworkMetrics();

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

    // let projectionMode = "averagePCA"; // or "allPCA"
    let projectionMode = "allPCA"; // or "averagePCA"
    App.views.pca.pcaPlot(data, App.models[projectionMode].pcaProject);
  }

}
