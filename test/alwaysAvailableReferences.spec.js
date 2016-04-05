"use strict"
let mocha = require("mocha");
let chai = require("chai");
chai.should();

var subject = require("../src/alwaysAvailableReferences.js");

describe("Always Available References", function() {
  it("are always defined in node.", function() {
    var undefinedReferences = Object.keys(subject).map(key => eval(key)).filter(item => !item)

    chai.expect(undefinedReferences.length).to.equal(3);
    chai.expect(undefinedReferences).to.eql([NaN, null, undefined]);
  });
});