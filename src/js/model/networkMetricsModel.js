"use strict"

var App = App || {};

let NetworkMetricsModel = function() {
  let self = {
    networkMetrics: {},
    attributes: [],

    avgSortInd: {},
    animalSortInd: {}
  };

  function loadNetworkMetrics() {
    // use promise to notify main when the data has been loaded
    return new Promise(function(resolve, reject) {
      // load data using d3 queue
      let dataLoadQueue = d3.queue();

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
          self.networkMetrics[animal] = {
            activations: {},
            average: {}
          };

          // summarize each activation
          for (let activation of App.runs[animal]) {
            self.networkMetrics[animal].activations[activation] = {};


            // create a zero filled array
            let sumVals = Array.apply(null, Array(self.attributes.length)).map(Number.prototype.valueOf, 0);

            _.forEach(allRuns[runInd], (d, i) => {
              for (let i = 0; i < self.attributes.length; i++) {
                sumVals[i] += +d[self.attributes[i]];
              }
            });

            let size = allRuns[runInd].length;

            for (let i = 0; i < self.attributes.length; i++) {
              self.networkMetrics[animal].activations[activation][self.attributes[i]] = sumVals[i] / size;
            }
            self.networkMetrics[animal].activations[activation].size = size;

            runInd++;
          }

          // calculate the Avg of all runs for the same mouse
          calculateMean(animal);

          // // calculate the Min of all runs for the same mouse
          // self.networkMetrics[animal]["runMin"] = {};
          // calculateMin(animal);
          //
          // // calculate the Max of all runs for the same mouse
          // self.networkMetrics[animal]["runMax"] = {};
          // calculateMax(animal);

        }

        // resolve within await callback after data finished processing
        resolve(self.networkMetrics);
      }

    });
  }

  /* calculate the avgerage of an animal */
  function calculateMean(animal) {
    // create a zero filled array
    let avgSumVals = new Array(self.attributes.length).fill(0);


    for (let i = 0; i < self.attributes.length; i++) {
      for (let activation of App.runs[animal]) {
        avgSumVals[i] += self.networkMetrics[animal].activations[activation][self.attributes[i]];
      }
      self.networkMetrics[animal].average[self.attributes[i]] = avgSumVals[i] / App.runs[animal].length;
    }

    // get the avg size for each animal
    self.networkMetrics[animal].average.size = 0;
    for (let activation of App.runs[animal]) {
      self.networkMetrics[animal].average.size += self.networkMetrics[animal].activations[activation].size;
    }
    self.networkMetrics[animal].average.size = self.networkMetrics[animal].average.size / App.runs[animal].length;
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

  /* get the range of metrics attributes of all runs */
  function getAttributesRange() {
    let attributesRange = {};

    for (let attribute of self.attributes) {
      let attributeValues = [];

      _.forEach(Object.values(self.networkMetrics), function(value, key) {
        _.forEach(Object.values(value.activations), function(d) {
          attributeValues.push(d[attribute]);
        });
      });

      attributesRange[attribute] = d3.extent(attributeValues);
    }

    return attributesRange;
  }

  /* get the range of networks size of all runs */
  function getNetworksSizeRange() {
    let sizeValues = [];

    _.forEach(Object.values(self.networkMetrics), function(value, key) {
      _.forEach(Object.values(value), function(d) {
        sizeValues.push(d.size);
      });
    });

    return d3.extent(sizeValues);
  }

  /* get the sortInd for runAvg based on the selected attribute */
  function getAvgSortInd() {
    // get the current selected attribute for sorting kiviats
    let attr = App.models.applicationState.getAttributeForSorting();

    calculateAvgSortIndBy(attr);

    return self.avgSortInd;
  }

  /* calculate the sortInd for runAvg based on the selected attribute */
  function calculateAvgSortIndBy(attr) {
    let oldNetworkMetrics = {};
    let youngNetworkMetrics = {};

    for (let animal of Object.keys(App.runs).sort()) {
      let animalInd = Object.keys(App.runs).sort().indexOf(animal);

      if (attr === "animal.id") {
        self.avgSortInd[animalInd] = animalInd;
      } else {
        if (animalInd < 5) {
          oldNetworkMetrics[animal] = self.networkMetrics[animal].average;
          oldNetworkMetrics[animal].animalInd = animalInd;
        } else {
          youngNetworkMetrics[animal] = self.networkMetrics[animal].average;
          youngNetworkMetrics[animal].animalInd = animalInd;
        }
      }
    }

    let sortedOldNetworks = _.reverse(_.sortBy(oldNetworkMetrics, function(o) {
      return o[attr];
    }));
    let sortedYoungNetworks = _.reverse(_.sortBy(youngNetworkMetrics, function(o) {
      return o[attr];
    }));

    _.forEach(sortedOldNetworks, function(value, i) {
      self.avgSortInd[value.animalInd] = i;
    });

    _.forEach(sortedYoungNetworks, function(value, i) {
      self.avgSortInd[value.animalInd] = i + 5;
    });

  }

  /* calculate the sortInd for current animal based on the selected attribute */
  function getAnimalSortInd() {
    // get the current selected attribute and animal for sorting kiviats
    let attr = App.models.applicationState.getAttributeForSorting();
    let animal = App.models.applicationState.getSelectedAnimal();

    calculateAnimalSortIndBy(attr, animal);

    return self.animalSortInd;
  }

  function calculateAnimalSortIndBy(attr, animal) {
    self.animalSortInd = {};
    let animalNetworkMetrics = {};

    // let runs = _.filter(Object.keys(animal), function(o) {
    //   return (o != "runAvg" && o != "runMin" && o != "runMax");
    // });
    let runs = Object.keys(animal.activations);

    for (let run of runs) {
      let runInd = runs.indexOf(run);

      if (attr === "animal.id") {
        self.animalSortInd[runInd] = runInd;
      } else {
        // animal[run].runInd = runInd;
        // animalNetworkMetrics[run] = animal[run];
        animalNetworkMetrics[run] = animal.activations[run];
        animalNetworkMetrics[run].runInd = runInd;
      }
    }

    console.log(animalNetworkMetrics);

    let sortedRuns = _.reverse(_.sortBy(animalNetworkMetrics, function(o) {
      return o[attr];
    }));

    _.forEach(sortedRuns, function(value, i) {
      self.animalSortInd[value.runInd] = i;
    });

  }


  return {
    loadNetworkMetrics,
    getNetworkMetrics,
    getMetricsAttributes,
    getAttributesRange,
    getNetworksSizeRange,
    getAvgSortInd,
    getAnimalSortInd
  };

}
