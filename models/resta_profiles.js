let mongoose = require("mongoose");

let resta_profilesSchema = mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  resta_name: {
    type: String,
    required: true,
  },
  resta_logo: {
    type: String,
    default: null,
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
    match: [/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number"],
  },
});

module.exports = mongoose.model("RestaProfile", resta_profilesSchema);
