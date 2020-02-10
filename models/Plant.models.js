const mongoose = require("mongoose");

const { Schema } = mongoose;

const Plant = new Schema({
  name: {
    type: String,
    unique: true,
  },
  createdDate: Date,
  lastWatering: Date,
  initialPhoto: String,
  initialColor: String,
  lastColor: String,
  lastPhoto: String,
  indoor: Boolean,
  status: String,
  condition: Number,
  type: String,
});

module.exports = mongoose.model("Plants", Plant);
