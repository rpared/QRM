let mongoose = require("mongoose");

let menuItemSchema = mongoose.Schema({
  resta_profile_id: {
    type: String,
    required: true,
  },
  item_id: {
    type: Number,
    required: true,
  },
  item_category: {
    type: String,
    required: true,
    enum: ["specials", "breakfast", "brunch", "main", "entrees", "beverages", "desserts", "specials", "hot-beverages"],
    default: null,
  },
  item_name: {
    type: String,
    required: true,
  },
  // item_photo: {
  //   type: String,
  //   default: null,
  // },
  item_photo: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: null,
      },
  },
  item_photo_thumbnail: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: null,
      },
  },
  item_description: {
    type: String,
    required: true,
  },
  item_labels: {
    type: [String],
    required: true,
    enum: ["spicy", "gluten-free", "vegan", "vegetarian"],
    default: [],
  },
  item_price: {
    type: Number,
    required: true,
    min: 0,
  },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
