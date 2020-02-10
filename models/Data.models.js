const mongoose = require("mongoose");

const { Schema } = mongoose;

const Data = new Schema({
  plant: String,
  plantPhoto: String,
  date: Date,
  color: String,
  delta: Number,
  type: String,
});

module.exports = mongoose.model("Datas", Data);
