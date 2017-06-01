"use strict"

var App = App || {};

let NetworkMetricsModel = function() {
    let self = {
        networkMetrics: {},
        attributes: []
    };

    function loadNetworkMetrics() {
        // use promise to notify main when the data has been loaded
        return new Promise(function(resolve, reject) {
            // load data using d3 queue
            let dataLoadQueue = d3.queue();

            for (let runInd in App.runs) {
                dataLoadQueue.defer(d3.csv, "data/" + App.runs[runInd] + "/network_metrics.csv");
            }

            dataLoadQueue.awaitAll(loadAllFiles);

            // called after all files are loaded
            function loadAllFiles(error, allRuns) {
                if (error) {
                    // reject an error in await callback
                    reject(error);
                }

                // an array of attributes in the network metrics
                self.attributes = allRuns[0].columns;
                self.attributes.shift();

                for (let runInd in allRuns) {
                    self.networkMetrics[App.runs[runInd]] = {};

                    let size = allRuns[runInd].length;

                    // create a zero filled array
                    let sumVals = Array.apply(null, Array(self.attributes.length)).map(Number.prototype.valueOf, 0);

                    _.forEach(allRuns[runInd], (d, i) => {
                        for (let i = 0; i < self.attributes.length; i++) {
                            sumVals[i] += +d[self.attributes[i]];
                        }
                    });

                    // self.networkMetrics[App.runs[runInd]]["Individual"] = id;
                    for (let i = 0; i < self.attributes.length; i++) {
                        self.networkMetrics[App.runs[runInd]][self.attributes[i]] = sumVals[i] / size;
                    }
                    self.networkMetrics[App.runs[runInd]].size = size;
                }

                // resolve within await callback after data finished processing
                resolve(self.networkMetrics);
            }

        });
    }

    function getNetworkMetrics() {
        return self.networkMetrics;
    }


    return {
        loadNetworkMetrics,
        getNetworkMetrics
    };
};
