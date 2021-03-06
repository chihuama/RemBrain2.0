"use strict"

var App = App || {};

let ProjectionModel = function(data) {
  // codes from http://jsfiddle.net/b7g9c/

  let self = {
    Ureduced: null,
    variance: [],
    k: 2 // number of dimensions to project into
  };

  init();

  function init() {
    // // calculate singular value decomposition
    // let svd = pca(data);
    //
    // // get U matrix -- principle components
    // let U = svd.U;
    //
    // // reduce the principle components to k dimensions (default of 2)
    // self.Ureduced = pcaReduce(U, self.k);


    // an eigendecomposition on the covariance matrix
    let cov_mat = covariance(data);
    let eig = numeric.eig(cov_mat);

    let diagonal_sum = 0;
    for (let i = 0; i < cov_mat.length; i++) {
      diagonal_sum += cov_mat[i][i];
    }

    // console.log(cov_mat);
    // console.log(diagonal_sum);
    // console.log(eig.lambda.x);
    // console.log(eig.E.x);

    self.variance.push((eig.lambda.x[0] * 100 / diagonal_sum).toFixed(1) + "%");
    self.variance.push((eig.lambda.x[1] * 100 / diagonal_sum).toFixed(1) + "%");
    console.log(self.variance);

    self.Ureduced = pcaReduce(eig.E.x, self.k);
    console.log(self.Ureduced);
  }

  /* return a matrix of all principle components as column vectors */
  function pca(X) {
    let m = X.length;
    console.log(m);
    let sigma = numeric.div(numeric.dot(numeric.transpose(X), X), m - 1);
    // console.log(sigma);

    return numeric.svd(sigma);
  } // n x n matrix (n dimensions)


  /* covariance matrix */
  function covariance(X) {
    let sum = [];
    _.map(numeric.transpose(X), function(colVal) {
      sum.push(_.sum(colVal));
    });

    let mean_vec = numeric.div(sum, X.length);
    // console.log(mean_vec);

    let cov_mat = (new Array(X[0].length)).fill(0).map(() => new Array(X[0].length).fill(0));

    _.map(X, function(row, i) {
      let subVec = numeric.sub(row, mean_vec);
      let subVecT = numeric.transpose([subVec]);
      // console.log(subVec, subVecT);

      let dot = numeric.dot(subVecT, [subVec]);
      // console.log(dot);

      cov_mat = numeric.add(cov_mat, dot);
    });

    cov_mat = numeric.div(cov_mat, X.length - 1);

    return cov_mat;
  }

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

  function getVariance() {
    return self.variance;
  }


  return {
    pcaProject,
    getVariance
  };

}
