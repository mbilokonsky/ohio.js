module.exports = `
var c = 3;

isolated
function sum(a, b) {
  return a + b + c;
}
`