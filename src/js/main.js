"use strict"

var App = App || {};

(function() {
    App.models = {};
    App.views = {};
    App.controllers = {};

    // hard code the folder name according to the activation runs
    App.runs = ["Old36_a1", "Old36_a2",
        "Old38_a1", "Old38_a2", "Old38_a3", "Old38_a4", "Old38_a5", "Old38_a6", "Old38_a7", "Old38_a8", "Old38_a9",
        "Old41_a1", "Old41_a2", "Old41_a3",
        "Young34_a1", "Young34_a2", "Young34_a3", "Young34_a4", "Young34_a5", "Young34_a6",
        "Young40_a1", "Young40_a2", "Young40_a3", "Young40_a4"
    ];

    App.init = function() {
        // create models
        App.models.networkMetrics = new NetworkMetricsModel();

        // load network metrics from all runs
        App.models.networkMetrics.loadNetworkMetrics()
            .then(function(data) {
                console.log("Promise Finished", data);
            })
            .catch(function(err) {
                console.log("Promise Error", err);
            });
    };

})();
