/* eslint-disable array-callback-return */
const express = require("express");

const router = express.Router();

const Plant = require("../models/Plant.models");

/* GET home page. */
router.get("/", function(req, res, next) {
  Plant.find(function(err, plants) {
    res.render("index", {
      title: "Plant Monitoring",
      plants,
      plantsWatered: plants.filter(data => {
        const now = new Date();
        const lastWatering = new Date(data.lastWatering);
        return (
          lastWatering.getDate() === now.getDate() &&
          lastWatering.getMonth() === now.getMonth() &&
          lastWatering.getFullYear() === now.getFullYear()
        );
      }),
    });
  });
});

module.exports = router;
