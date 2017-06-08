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

      // for (let runInd in App.runs) {
      //     dataLoadQueue.defer(d3.csv, "data/" + App.runs[runInd] + "/network_metrics.csv");
      // }

      for (let animal of Object.keys(App.runs).sort()) {
        for (let activation of App.runs[animal]) {
          dataLoadQueue.defer(d3.csv, "data/" + animal + "/" + activation + "/network_metrics.csv");
        }
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

        /* data structure:
          {"Old36": {"a1": {}, "a2": {}, ..., "runAvg": {}, "runMin": {}, "runMax": {}},
           "Old38": {}, ..., "Young40": {}} */
        let runInd = 0;

        for (let animal of Object.keys(App.runs).sort()) {
          self.networkMetrics[animal] = {};

          // summarize each activation
          for (let activation of App.runs[animal]) {
            self.networkMetrics[animal][activation] = {};

            // create a zero filled array
            let sumVals = Array.apply(null, Array(self.attributes.length)).map(Number.prototype.valueOf, 0);

            _.forEach(allRuns[runInd], (d, i) => {
              for (let i = 0; i < self.attributes.length; i++) {
                sumVals[i] += +d[self.attributes[i]];
              }
            });

            let size = allRuns[runInd].length;

            for (let i = 0; i < self.attributes.length; i++) {
              self.networkMetrics[animal][activation][self.attributes[i]] = sumVals[i] / size;
            }
            self.networkMetrics[animal][activation].size = size;

            runInd++;
          }

          // calculate the Avg of all runs for the same mouse
          self.networkMetrics[animal]["runAvg"] = {};
          calculateMean(animal);

          // calculate the Min of all runs for the same mouse
          self.networkMetrics[animal]["runMin"] = {};
          calculateMin(animal);

          // calculate the Max of all runs for the same mouse
          self.networkMetrics[animal]["runMax"] = {};
          calculateMax(animal);

        }

        // resolve within await callback after data finished processing
        resolve(self.networkMetrics);
      }

    });
  }


  function calculateMean(animal) {
    // create a zero filled array
    let avgSumVals = Array.apply(null, Array(self.attributes.length)).map(Number.prototype.valueOf, 0);

    for (let i = 0; i < self.attributes.length; i++) {
      for (let activation of App.runs[animal]) {
        avgSumVals[i] += self.networkMetrics[animal][activation][self.attributes[i]];
      }
      self.networkMetrics[animal]["runAvg"][self.attributes[i]] = avgSumVals[i] / App.runs[animal].length;
    }

    // get the avg size for each animal
    self.networkMetrics[animal]["runAvg"].size = 0;
    for (let activation of App.runs[animal]) {
      self.networkMetrics[animal]["runAvg"].size += self.networkMetrics[animal][activation].size;
    }
    self.networkMetrics[animal]["runAvg"].size = self.networkMetrics[animal]["runAvg"].size / App.runs[animal].length;
  }

  function calculateMin(animal) {

  }

  function calculateMax(animal) {

  }

  function getNetworkMetrics() {
    return self.networkMetrics;
  }

  function getMetricsAttributes() {
    return self.attributes;
  }

  function calculateSortIndBy(attr) {
    let sortInd = {};
    let oldNetworkMetrics = {};
    let youngNetworkMetrics = {};

    for (let animal of Object.keys(App.runs).sort()) {
      let animalInd = Object.keys(App.runs).sort().indexOf(animal);
      if (attr === "animal.id") {
        sortInd[animalInd] = animalInd;
      } else {
        if (animalInd < 5) {
          oldNetworkMetrics[animal] = self.networkMetrics[animal].runAvg;
          oldNetworkMetrics[animal].animalInd = animalInd;
        } else {
          youngNetworkMetrics[animal] = self.networkMetrics[animal].runAvg;
          youngNetworkMetrics[animal].animalInd = animalInd;
        }
      }
    }

    let sortedOldNetworks = _.reverse(_.sortBy(oldNetworkMetrics, function(o) {
      return o[attr];
    }));
    let sortedYoungNetworks = _.reverse(_.sortBy(youngNetworkMetrics, function(o){
      return o[attr];
    }));

    _.forEach(sortedOldNetworks, function(value, i){
      sortInd[value.animalInd] = i;
    });

    _.forEach(sortedYoungNetworks, function(value, i){
      sortInd[value.animalInd] = i + 5;
    });

    return sortInd;
  }


  return {
    loadNetworkMetrics,
    getNetworkMetrics,
    getMetricsAttributes,
    calculateSortIndBy
  };
};
