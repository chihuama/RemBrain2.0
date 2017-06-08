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
        // console.log(self.currentAttribute);
        // get sortInd from networkMetrics models
        let sortInd = App.models.networkMetrics.calculateSortIndBy(self.currentAttribute);

        // update views
        App.views.kiviatSummary.updateSortInd(sortInd);
    }


    return {
        attachToSelect,
        populateAttributeDropDown
    };

}
