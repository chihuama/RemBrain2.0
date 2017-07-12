"use strict"

var App = App || {};

let PcaAttrSelectorController = function(listID) {
  let self = {
    list: null,
    checkboxStates: {}
  };

  init();

  function init() {
    let attributes = _.drop(App.sortingAttributes);

    for (let attribute of attributes) {
      self.checkboxStates[attribute] = true;
    }

    self.list = d3.select(listID);

    self.list.selectAll(".checkbox-li")
      .data(attributes)
      .enter().append("li")
      .attr("class", "checkbox-li")
      .each(function(d, i) {
        let div = d3.select(this).append("div").attr("class", "checkbox");

        div.append("input")
          .attr("class", "separated-checkbox")
          .attr("checked", true)
          .attr("type", "checkbox")
          .attr("value", d)
          .attr("id", "pcaAttrCheck" + d)
          .on("click", checkboxOnChange);

        div.append("label")
          .attr("for", "pcaAttrCheck" + d)
          .text(d);
      });
  }

  function checkboxOnChange() {
    let checkbox = d3.select(this).node();

    self.checkboxStates[checkbox.value] = checkbox.checked;

    // console.log(self.checkboxStates);

    App.pcaAttributes[checkbox.value] = checkbox.checked;

    updateViews();
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
