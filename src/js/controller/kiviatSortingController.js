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
    App.models.networkMetrics.getSimilaritySortInd(animal);
  }

  /* check if it is the mode for selecting an animal and sorting the rest by their similarity scores */
  function similarityMode(value) {
    console.log(value);

    if (value) {
      self.attributeDropDown.attr("disabled", true);

      // reset to sort by animalId
      self.currentAttribute = "animal.id";
      self.attributeDropDown.node().value = self.currentAttribute;
      updateSelectedAttribute();
      sortAccordingTo("Old36");
    } else {
      self.attributeDropDown.attr("disabled", null);

      // reset to sort by animalId
      self.currentAttribute = "animal.id";
      self.attributeDropDown.node().value = self.currentAttribute;
      updateSelectedAttribute();
    }
  }


  return {
    attachToSelect,
    populateAttributeDropDown,
    updateSelectedAttribute,
    similarityMode
  };

}
