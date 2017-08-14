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

        for(let time of Object.keys(self.networkDynamics)) {
          delete self.networkDynamics[time].size;
        }

        resolve(self.networkDynamics);
      });
    });

  }


  function getNetworkDynamics() {
    return self.networkDynamics;
  }


  return {
    loadNetworkDynamics,
    getNetworkDynamics
  };

}
