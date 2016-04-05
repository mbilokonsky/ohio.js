var estraverse = require('estraverse');
var references = require("episcope/references");
var bindings = require("episcope/bindings");

// grabbed these from here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
var alwaysAcceptable = require("./alwaysAvailableReferences");

function createsNewScope(node){
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}

function scopeFlattener(acc, val) {
  for (var key in val) {
    acc[key] = val[key];
  }

  return acc;
}

module.exports = function(node) {
  // assert that node is an AST
  if (!node.type || !node.body) {
    throw new TypeError("input must be an AST node");
  }

  if (node.type !== "FunctionDeclaration") {
    throw new TypeError("input AST node must be a FunctionDeclaration");
  }

  /*
    1. find all tokens that are valid
    2. iterate through all tokens in function
    3. return false if any tokens in function are not valid
    4. return true;
  */

  var retVal = true;
  var scopes = [];
  estraverse.traverse(node, {
    enter: function(n) {
      if (createsNewScope(n)) {
        scopes.push(bindings(n).reduce(function(acc, val) {
          acc[val.name] = true;
          return acc;
        }, {}));

        var valid_refs = Object.assign({}, alwaysAcceptable, scopes.reduce(scopeFlattener, {}));

        var found_refs = references(n);

        var invalid_refs = found_refs.filter(function(ref) {
          return !valid_refs[ref.name];
        });

        if (invalid_refs.length > 0) {
          retVal = false;
          this.break;
        }
      }
    },
    leave: function(node) {
      if (createsNewScope(node)) {
        scopes.pop();
      }
    }
  })

  return retVal;
}