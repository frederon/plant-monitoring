/* eslint-disable array-callback-return */
const express = require("express");
const axios = require("axios");

const router = express.Router();

const Plant = require("../models/Plant.models");

/* GET home page. */
router.get("/", function(req, res, next) {
  const time = new Date();
  axios
    .get(
      "https://api.darksky.net/forecast/b4a5cced3d18c04794c8b5b60fd2e8ba/6.9175,107.6191"
    )
    .then(result => {
      Plant.find(function(err, plants) {
        res.render("index", {
          title: "Plant Monitoring",
          plants,
          plantsWatered: plants.filter(plant => {
            const lastWatering = new Date(plant.lastWatering);
            return (
              lastWatering.getDate() === time.getDate() &&
              lastWatering.getMonth() === time.getMonth() &&
              lastWatering.getFullYear() === time.getFullYear()
            );
          }),
          time,
          weather: result.data,
        });
      });
    });
});

module.exports = router;
