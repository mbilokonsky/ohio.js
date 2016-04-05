var esprima = require('esprima');
var estraverse = require('estraverse');
var properties = require("episcope/properties");

var confirmIsolation = require("./confirmIsolation");

var test = `
/*
  > sum(2, 2)
  < 4
*/
isolated
function sum(a, b) {
  var foobar = "whatever";
  return a + b;
}

function notIsolated() {
  return "whatever";
}
`

var parsedOutput = esprima.parse(test, {comment: true})

console.log();

parsedOutput.body = parsedOutput.body.reduce(function(acc, val) {
  if (acc.expectIsolatedFunction) {
    if (val.type !== "FunctionDeclaration") {
      throw new Error("Expected a function declaration, but got " + val.type);
    }

    if (!confirmIsolation(val)) {
      throw new Error("Function " + val.id.name + " annotated as isolated, but isolation test failed.");
    }

    val.isIsolated = true;
  }

  if (val.type === "ExpressionStatement") {
    if (val.expression.name === "isolated") {
      acc.expectIsolatedFunction = true;
      return acc;
    }
  }

  acc.expectIsolatedFunction = false;
  acc.elements.push(val);

  return acc;
}, {elements: [], expectIsolatedFunction: false}).elements;

console.log(parsedOutput);