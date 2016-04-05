"use strict"
let mocha = require("mocha");
let chai = require("chai");
let esprima = require("esprima");
let confirmIsolation = require("../src/confirmIsolation");

chai.should();

describe("confirmIsolation", function() {
  describe("must be called with an AST FunctionDeclaration node", function() {
    it("throws a TypeError if called with a string", function() {
      var function_string = require("./test_data/isolated_function");
      chai.expect(confirmIsolation.bind(null, function_string)).to.throw(TypeError);
    });

    it("throws a TypeError if called with no arguments", function() {
      chai.expect(confirmIsolation).to.throw(TypeError);
    });

    it("throws a TypeError if passed an AST node other than a FunctionDeclaration", function() {
      var function_string = require("./test_data/isolated_function");
      var input = esprima.parse(function_string);
      chai.expect(confirmIsolation.bind(null, input)).to.throw(TypeError);
    });
  });

  describe("recognizes a correctly isolated function", function() {
    it("works with a simple sum function", function() {
      var function_string = require("./test_data/isolated_function");
      var input = esprima.parse(function_string).body[1];

      var result = confirmIsolation(input);
      chai.expect(result);
    });
  });

  describe("recognizes isolation violations", function() {
    it("when a variable is inherited via scope", function() {
      var function_string = require("./test_data/lying_isolated_function");
      var input = esprima.parse(function_string).body[2];
      var result = confirmIsolation(input);
      chai.expect(result).to.be.false
    })
  });
});