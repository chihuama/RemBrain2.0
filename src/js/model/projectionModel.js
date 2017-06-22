"use strict"

var App = App || {};

let ProjectionModel = function(data) {
  // codes from http://jsfiddle.net/b7g9c/

  let self = {
    Ureduced: null,
    k: 2 // number of dimensions to project into
  };

  init();

  function init() {
    // calculate singular value decomposition
    let svd = pca(data);
    // get U matrix -- principle components
    let U = svd.U;

    // reduce the principle components to k dimensions (default of 2)
    self.Ureduced = pcaReduce(U, self.k);
  }

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
  function pcaProject(X) {
    if (!self.Ureduced) {
      return X;
    }

    return numeric.dot(X, self.Ureduced);
  } // X = m x n, Ureduce = n x 2, => m x 2

  return {
    pcaProject
  };

}
