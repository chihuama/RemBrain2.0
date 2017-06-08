"use strict"

var App = App || {};

let ApplicationStateModel = function() {

    let self = {
        attributesForPCA: null,
        attributeForSorting: "Animal Name" // default by name
    };

    function setAttributesForPCA(attrs) {
        self.attributesForPCA = attrs;
    }

    function getAttributesForPCA() {
        return self.attributesForPCA;
    }

    function setAttributeForSorting(attr) {
        self.attributeForSorting = attr;
    }

    function getAttributeForSorting() {
        return self.attributeForSorting;
    }

    return {
        setAttributesForPCA,
        getAttributesForPCA,
        setAttributeForSorting,
        getAttributeForSorting
    };

}
