const handlebarsHelpers = {
    eq: function (a, b) {
      return a === b;
    },
    includes: function (arrayOrString, value) {
        if (Array.isArray(arrayOrString)) {
          return arrayOrString.includes(value);
        }
        if (typeof arrayOrString === 'string') {
          return arrayOrString.indexOf(value) !== -1;
        }
        return false;
      }
    // Add other helpers here, hope I dont need more ugh
  };
  
  module.exports = handlebarsHelpers;
  