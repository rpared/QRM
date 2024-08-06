let mongoose = require("mongoose");

let restaprofilesSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  resta_name: {
    type: String,
    required: true,
  },
  resta_logo: {
    data: {
      type: Buffer,
      default: null,
    },
    contentType: {
      type: String,
      default: null,
    },
  },
  resta_logo_thumbnail: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: null,
      },
  },
  resta_description: {
    type: String,
    default: null,
  },
  resta_location: {
    type: String,
    required: true,
  },
  resta_hours: {
    type: String,
    required: true,
  },
  resta_email: {
    type: String,
    default: null,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  resta_phone: {
    type: String,
    default: null,
    match: [/^\d{3}-\d{3}-\d{4}$|^\d{10}$/, "Please enter a valid phone number"],
  },
  headerColor:{
    type: String,
    default: null,
  },
  bodyColor: {
    type: String,
    default: null,
  },
  fontColor:{
    type: String,
    default: null,
  },
  itemBackgroundColor:{
    type: String,
    default: null,
  }
});

module.exports = mongoose.model("RestaProfile", restaprofilesSchema);
