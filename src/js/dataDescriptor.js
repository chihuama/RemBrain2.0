"use strict"

var App = App || {};


/* the folder name according to the activation runs */
App.runs = {
  "Old36": ["a1", "a2"],
  "Old37": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
  "Old38": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"],
  "Old41": ["a1", "a2", "a3"],
  "Old42": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
  "Young33": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14"],
  "Young34": ["a1", "a2", "a3", "a4", "a5", "a6"],
  "Young35": ["a1", "a2", "a4", "a6", "a7", "a8", "a9"],
  "Young39": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"],
  "Young40": ["a1", "a2", "a3", "a4"],
}

/* ten attributes of the newwork metrics from statistic analysis + the animal id,
   those arributes are also used to sort the kiviat diagrams */
App.sortingAttributes = ["animal.id", "observed", "time.span", "switching",
  "absence", "visiting", "homing", "avg.group.size", "avg.comm.size", "avg.stay", "max.stay"
];

/* attribute descriptors for the network metrics */
App.attrDescriptor = {
  "observed": "Number of time steps a node is active or observed (normalized by the entire time steps)",
  "time.span": "Average span of the communities (the last time step minus the first time step of the community's existence) with which an individual is affiliated (as a member or absent)",
  "switching": "Number of community switches made by an individual (normalized by the number of time steps an individual is observed)",
  "absence": "Number of absences of an individual from a community (normalized by the number of time steps an individual is observed)",
  "visiting": "Number of visits made by an individual to another community (normalized by the number of time steps an individual is observed)",
  "homing": "Fraction of individual's current peers, at each time step, who were peers in the previous time step",
  "avg.group.size": "Average size of group of which an individual is a member",
  "avg.comm.size": "Average size of community of which an individual is affiliated (as a member or absent)",
  "avg.stay": "Average number of consecutive time steps an individual stays as a member of the same community (normalized by the number of time steps an individual is observed)",
  "max.stay": "Maximum number of consecutive time steps an individual stays as a member of the same community (normalized by the number of time steps an individual is observed)"
};
