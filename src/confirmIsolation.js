var estraverse = require('estraverse');

var alwaysAcceptable = {
  Array: true,
  String: true,
  Object: true,
  console: true
}

function createsNewScope(node){
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
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

  var acceptable_identifiers = Object.assign({}, alwaysAcceptable, node.params.reduce(function(acc, value) {
    acc[value.name] = true
    return acc;
  }, {}));

  var retVal = true;

  estraverse.traverse(node, {
    enter: function(n) {
      if (n.type === "Identifier" && !acceptable_identifiers[n.name]) {
        retVal = false;
        this.break;
      }
    },
    leave: function(n) {

    }
  });

  return retVal;
}