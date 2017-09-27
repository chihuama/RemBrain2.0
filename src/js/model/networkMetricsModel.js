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
      _.forEach(Object.values(value.activations), function(d) {
        sizeValues.push(d.size);
      });
    });

    return d3.extent(sizeValues);
  }

  /* get the sortInd for animals (runAvg) based on the selected attribute */
  function getAnimalSortInd() {
    // get the current selected attribute for sorting kiviats
    let attr = App.models.applicationState.getAttributeForSorting();

    calculateAnimalSortIndBy(attr);

    return self.avgSortInd;
  }

  /* calculate the sortInd for animals (runAvg) based on the selected attribute */
  function calculateAnimalSortIndBy(attr) {
    let networkMetricsAvg = {};

    for (let animal of Object.keys(App.runs).sort()) {
      let animalInd = Object.keys(App.runs).sort().indexOf(animal);

      if (attr === "animal.id") {
        self.avgSortInd[animal] = animalInd;
      } else {
        networkMetricsAvg[animal] = self.networkMetrics[animal].average;
        networkMetricsAvg[animal].animalId = animal;
      }
    }

    let sortedNetworks = _.reverse(_.sortBy(networkMetricsAvg, function(o) {
      return o[attr];
    }));

    _.forEach(sortedNetworks, function(value, i) {
      self.avgSortInd[value.animalId] = i;
    });

  }

  /* calculate the sortInd for activations of the current animal based on the selected attribute */
  function getActivationSortInd() {
    // get the current selected attribute and animal for sorting kiviats
    let attr = App.models.applicationState.getAttributeForSorting();
    let animal = App.models.applicationState.getSelectedAnimal();

    calculateActivationSortIndBy(attr, animal);

    return self.animalSortInd;
  }

  function calculateActivationSortIndBy(attr, animal) {
    self.animalSortInd = {};
    let animalNetworkMetrics = {};

    let runs = Object.keys(animal.activations);

    for (let run of runs) {
      let runInd = runs.indexOf(run);

      if (attr === "animal.id") {
        self.animalSortInd[run] = runInd;
      } else {
        animalNetworkMetrics[run] = animal.activations[run];
        animalNetworkMetrics[run].runId = run;
      }
    }

    let sortedRuns = _.reverse(_.sortBy(animalNetworkMetrics, function(o) {
      return o[attr];
    }));

    _.forEach(sortedRuns, function(value, i) {
      self.animalSortInd[value.runId] = i;
    });

  }

  /* calculate the sortInd for animals based on their similarity scores to the selected animal */
  function getAnimalSimSortInd(selectedAnimal) {
    let sd = {};
    let similaritySortInd = {};

    let attributeExtents = App.models.networkMetrics.getAttributesRange();

    _.forEach(Object.keys(self.networkMetrics), function(animal) {
      let x2 = 0;
      _.forEach(Object.values(self.attributes), function(attr) {
        // let x = self.networkMetrics[animal].average[attr] - self.networkMetrics[selectedAnimal].average[attr];
        let x = (self.networkMetrics[animal].average[attr] - self.networkMetrics[selectedAnimal].average[attr]) / (attributeExtents[attr][1] - attributeExtents[attr][0]);

        x2 += Math.pow(x, 2);
      });

      sd[animal] = Math.sqrt(x2 / (self.attributes.length - 1));
    });

    let sortedSD = _.sortBy(sd, function(o) {
      return o;
    });

    _.forEach(Object.keys(self.networkMetrics), function(animal) {
      similaritySortInd[animal] = _.indexOf(sortedSD, sd[animal]);
    });

    // console.log(similaritySortInd);
    return similaritySortInd;
  }

  function getActivationSimSortInd(animalId) {
    let sd = {};
    let similaritySortInd = {};

    let attributeExtents = App.models.networkMetrics.getAttributesRange();

    _.forEach(Object.keys(self.networkMetrics[animalId].activations), function(activation) {
      let x2 = 0;
      _.forEach(Object.values(self.attributes), function(attr) {
        // let x = self.networkMetrics[animalId].activations[activation][attr] - self.networkMetrics[animalId].average[attr];
        let x = (self.networkMetrics[animalId].activations[activation][attr] - self.networkMetrics[animalId].average[attr]) / (attributeExtents[attr][1] - attributeExtents[attr][0]);

        x2 += Math.pow(x, 2);
      });

      sd[activation] = Math.sqrt(x2 / (self.attributes.length - 1));
    });

    let sortedSD = _.sortBy(sd, function(o) {
      return o;
    });

    _.forEach(Object.keys(self.networkMetrics[animalId].activations), function(activation) {
      similaritySortInd[activation] = _.indexOf(sortedSD, sd[activation]);
    });
    console.log(similaritySortInd);
    return similaritySortInd;
  }


  return {
    loadNetworkMetrics,
    getNetworkMetrics,
    getMetricsAttributes,
    getAttributesRange,
    getNetworksSizeRange,
    getAnimalSortInd,
    getActivationSortInd,
    getAnimalSimSortInd,
    getActivationSimSortInd
  };

}
