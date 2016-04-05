module.exports = `
isolated
function sum(a, b) {
  function internal_sum(z) {
    return a + z;
  }

  return internal_sum(b);
}
`;