"use strict"

var App = App || {};

let PcaAttrSelectorController = function() {
  let self = {
    list: null,
    attributes: null,
    checkboxStates: {},
    selectedAttrInds: [],

    toggleButtons: null,
    mode: "averagePCA",

    attrTip: null
  };

  init();

  function init() {
    // let attributes = _.drop(App.sortingAttributes);
    self.attributes = Object.keys(App.pcaAttributes);

    for (let attribute of self.attributes) {
      self.checkboxStates[attribute] = true;
    }

    self.selectedAttrInds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    attachToList("#pcaAttributesSelector");
    attachToSelectToggle("#pcaButton");
  }


  function attachToList(listID) {
    self.list = d3.select(listID);

    // creatToolTips();
    // self.list.call(self.attrTip);

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
          .text(d)
          // .datum({
          //   "descriptor": App.attrDescriptor[d]
          // })
          // .on('mouseover', self.attrTip.show)
          // .on('mouseout', self.attrTip.hide);
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

  function attachToSelectToggle(buttonID) {
    self.toggleButtons = d3.selectAll(buttonID)
      .on("click", toggleButtonOnCLick);
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

    updateSelectedAttrInds();
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
      updateSelectedAttrInds();
      updateViews();
      // let animalId = App.models.applicationState.getSelectedAnimalId();
      // App.views.pca.selectAnimal(animalId);
    }
  }

  function updateSelectedAttrInds() {
    self.selectedAttrInds = [];
    _.forEach(Object.values(App.pcaAttributes), function(value, i) {
      if (value === true) {
        self.selectedAttrInds.push(i);
      }
    });
  }

  function toggleButtonOnCLick() {
    self.mode = d3.select(this).attr("value");

    self.toggleButtons.classed("active", function() {
      return d3.select(this).attr("value") === self.mode;
    });

    console.log(self.mode);

    updateViews();
  }


  function updateViews() {
    let data = App.models.networkMetrics.getNetworkMetrics();
    App.views.pca.pcaPlot(data, self.mode);

    // reset to avg mode for the kiviat summary view
    let animalId = App.models.applicationState.getSelectedAnimalId();
    if (animalId != null && self.mode === "averagePCA") {
      App.views.pca.selectAnimal(animalId);
    }
  }

  // function creatToolTips() {
  //   self.attrTip = d3.tip()
  //     .attr("class", "d3-tip")
  //     .direction("e")
  //     .html(function(d) {
  //       return d.descriptor;
  //     });
  // }

  function getMode() {
    return self.mode;
  }

  function getSelectedAttrInds() {
    return self.selectedAttrInds;
  }


  return {
    getMode,
    getSelectedAttrInds
  };

}
