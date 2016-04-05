module.exports = `
  isolated
  function nativeTest() {
    console.log(Object.keys(arguments));
    console.log(new String("foobar!"));
    return Object.keys(new Array());
  }
`;