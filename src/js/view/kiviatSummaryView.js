"use strict"

var App = App || {};

let KiviatSummaryView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        attributeScales: {}
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 600 400")
            .attr("preserveAspectRatio", "xMidYMid")
            .style("background", "pink");
    }

    function update() {
        // get attributes from networkMetricsModel
        let attributes = App.getMetricsAttributes();

        for (let attribute of attributes) {
            self.attributeScales[attribute] = d3.scaleOrdinal()
                .domain([0, 1])
                .range([5, 35]);
        }
    }

}
