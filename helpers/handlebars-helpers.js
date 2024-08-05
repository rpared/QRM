const labelIcons = {
  vegan: "/images/vegan_label.png",
  spicy: "/images/spicy_label.png",
  "gluten-free": "/images/gluten_free_label.png", //Darn hyphen causes trouble!! 
  vegetarian: "/images/vegetarian_label.png"
};

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
      },

      getLabelIcon: function(label) {
      return labelIcons[label] || ''; // Return empty string if no icon found
      }
    // Add other helpers here, hope I dont need more ugh
  };
  
  module.exports = handlebarsHelpers;
  