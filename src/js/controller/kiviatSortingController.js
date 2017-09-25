"use strict"

var App = App || {};

let KiviatSortingController = function() {

  let self = {
    attributeDropDown: null,
    currentAttribute: "animal.id"
  };

  /* display the drop down list of attributes for sorting kiviat diagrams */
  function populateAttributeDropDown() {
    self.attributeDropDown
      .selectAll("option")
      .data(App.sortingAttributes)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);
  }

  /* attach the event listener to the patient drop down list */
  function attachToSelect(element) {
    self.attributeDropDown = d3.select(element)
      .on("change", function(d) {
        self.currentAttribute = d3.select(this).node().value;
        updateSelectedAttribute();
      });

    populateAttributeDropDown();
  }

  /* update views based on the current selected attribute */
  function updateSelectedAttribute() {
    // update the application state
    App.models.applicationState.setAttributeForSorting(self.currentAttribute);

    // get sortInd from networkMetrics models
    let animalSortInd = App.models.networkMetrics.getAnimalSortInd();
    let activationSortInd = null;
    if (App.models.applicationState.getSelectedAnimal()) {
      activationSortInd = App.models.networkMetrics.getActivationSortInd();
    }

    // update views
    App.views.kiviatSummary.updateSortInd(animalSortInd, activationSortInd);
    App.views.kiviatSummary.highlightAxis(self.currentAttribute);
  }


  /* sort animals according to the selected one */
  function sortAccordingTo(animal) {
    // get sortInd from networkMetrics models
    let animalSortInd = App.models.networkMetrics.getAnimalSimSortInd(animal);
    let activationSortInd = null;
    if (App.models.applicationState.getSelectedAnimal()) {
      activationSortInd = App.models.networkMetrics.getActivationSimSortInd(animal);
    }

    // update views
    App.views.kiviatSummary.updateSortInd(animalSortInd, activationSortInd);
    App.views.kiviatSummary.highlightSelectedMouse("kiviatAvg", animal);
  }

  /* check if it is the mode for selecting an animal and sorting the rest by their similarity scores */
  function similarityMode(value) {
    // console.log(value);
    if (value) {
      self.attributeDropDown.attr("disabled", true);
      App.models.applicationState.setSimilarityMode(true);

      let animalSortInd = App.models.networkMetrics.getAnimalSortInd();

      let animalAtInd0 = _.findKey(animalSortInd, function(o) {
        return o == 0;
      });
      sortAccordingTo(animalAtInd0);
    } else {
      self.attributeDropDown.attr("disabled", null);
      App.models.applicationState.setSimilarityMode(false);

      d3.select(".select-kiviatAvg").remove();
      updateSelectedAttribute();
    }
  }


  return {
    attachToSelect,
    updateSelectedAttribute,
    sortAccordingTo,
    similarityMode
  };

}
