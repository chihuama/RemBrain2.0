"use strict"

var App = App || {};

let PcaModel = function() {
  // codes from http://jsfiddle.net/b7g9c/

  let self = {
    pcaProjection: [],
    Umatrix: null
  };

  /* return a matrix of all principle components as column vectors */
  function pca(X) {
    let m = X.length;
    let sigma = numeric.div(numeric.dot(numeric.transpose(X), X), m);

    return numeric.svd(sigma);
  } // n x n matrix (n dimensions)

  /* return a matrix of k first pc*/
  function pcaReduce(U, k) {
    return U.map(function(row) {
      return row.slice(0, k)
    });
  } // k = 2, => n x 2

  /* project matrix X onto reduced pc matrix */
  function pcaProject(X, Ureduce) {
    return numeric.dot(X, Ureduce);
  } // X = m x n, Ureduce = n x 2, => m x 2

  /* get the pca projection on k dimensions */
  function getPCA(data, k) {
    let X = [];

    for (let animal of Object.keys(App.runs).sort()) {
      // X.push(data[animal].runAvg);
      let dimensions = [];
      _.forEach(data[animal].runAvg, function(value, key) {
        if (key != "size") {
          dimensions.push(value);
        }
      });

      X.push(dimensions);
    }
    console.log(X);


    let svd = pca(X);
    let U = svd.U;

    console.log(svd);

    let Ureduce  = self.Umatrix = pcaReduce(U, k);

    self.pcaProjection = pcaProject(X, Ureduce);
    console.log(self.pcaProjection);

    return pcaProject(X, Ureduce);
  }

  function applyExistingPCA(data) {
    return pcaProject(data, self.Umatrix);
  }

  return {
    getPCA,
    applyExistingPCA
  };

}
