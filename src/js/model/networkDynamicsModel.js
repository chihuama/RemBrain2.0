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
    // console.log(nodeDegrees);
    return _.max(nodeDegrees);
  }


  return {
    loadNetworkDynamics,
    getNetworkDynamics,
    getMaxNodeDegree
  };

}
