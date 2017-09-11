"use stric"

var App = App || {};

let NetworkDynamicsModel = function() {
  let self = {
    animalId: null,
    activationId: null,

    networkDynamics: {}
  }


  function loadNetworkDynamics(animalId, activationId) {
    self.animalId = animalId;
    self.activationId = activationId;
    // console.log("selected run: " + animalId + "-" + activationId);

    return new Promise(function(resolve, reject) {
      d3.json("data/" + self.animalId + "/" + self.activationId + "/dataCompressed.json", function(error, data) {
        if (error) { // reject an error in await callback
          reject(error);
        }

        self.networkDynamics = data;

        for (let time of Object.keys(self.networkDynamics)) {
          delete self.networkDynamics[time].size;
        }

        resolve(self.networkDynamics);
      });
    });

  }

  function getNetworkDynamics() {
    return self.networkDynamics;
  }

  function getMaxNodeDegree() {
    let nodeDegrees = [];
    _.forEach(Object.values(self.networkDynamics), function(pixels, time) {
      if (time <= 100) { // duration the entire time
        _.forEach(pixels, function(value, key) {
          // nodeDegrees.push(self.networkDynamics[time][key][2]);
          nodeDegrees.push(pixels[key][2]);
        });
      }
    });

    return _.max(nodeDegrees);
  }

  function getMaxActiveNodes() {
    console.log(Object.keys(self.networkDynamics[50]).length);
    return Object.keys(self.networkDynamics[50]).length;
  }


  function getCommunity_distributions() {
    let distributions = [];

    _.forEach(Object.keys(self.networkDynamics), function(time) {
      if (time >= 0 && time <= 100) {
        let row = {};
        row["time"] = time;
        for (let i = 0; i <= 10; i++) {
          row[i] = 0;
        }

        _.forEach(Object.keys(self.networkDynamics[time]), function(pixel) {
          let groupId = self.networkDynamics[time][pixel][0];
          row[groupId]++;
        });

        distributions.push(row);
      }
    });

    return distributions;
  }


  return {
    loadNetworkDynamics,
    getNetworkDynamics,
    getMaxNodeDegree,
    getMaxActiveNodes,
    getCommunity_distributions
  };

}
