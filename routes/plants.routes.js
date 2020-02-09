/* eslint-disable no-restricted-properties */
const express = require("express");

const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const Plant = require("../models/Plant.models");
const Data = require("../models/Data.models");

const getRGB = str =>
  str
    .replace(/(^rgba\()/g, "")
    .replace(/,1\)$/g, "")
    .split(",")
    .map(s => Number(s));

function rgb2lab(rgb) {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;
  let x;
  let y;
  let z;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(rgbA, rgbB) {
  const labA = rgb2lab(rgbA);
  const labB = rgb2lab(rgbB);
  const deltaL = labA[0] - labB[0];
  const deltaA = labA[1] - labB[1];
  const deltaB = labA[2] - labB[2];
  const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  const deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  const sc = 1.0 + 0.045 * c1;
  const sh = 1.0 + 0.015 * c1;
  const deltaLKlsl = deltaL / 1.0;
  const deltaCkcsc = deltaC / sc;
  const deltaHkhsh = deltaH / sh;
  const i =
    deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

router.get("/:id", (req, res, next) => {
  Plant.findById(req.params.id).then(plant =>
    Data.find({ plant: req.params.id }).then(data =>
      res.render("plant", {
        title: plant.name,
        plant,
        history: data.sort((a, b) =>
          new Date(a.date) < new Date(b.date) ? 1 : -1
        ),
      })
    )
  );
});

router.get("/:id/water", (req, res, next) => {
  Data.find({ plant: req.params.id }).then(data =>
    res.json(
      data.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1))
    )
  );
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/plants");
  },
  filename(req, file, cb) {
    const customFileName = crypto.randomBytes(18).toString("hex"); // Appending .jpg
    cb(null, `${customFileName}.jpg`);
  },
});

router.post("/create", multer({ storage }).any(), function(req, res, next) {
  const { name, color, indoor } = req.body;
  console.log(name, color, indoor);
  const now = new Date();
  const plant = new Plant({
    name,
    createdDate: now,
    lastWatering: now,
    initialPhoto: req.files[0].filename,
    initialColor: color,
    indoor: indoor !== undefined,
    status: "Good",
    condition: 100,
  });
  const data = new Data({
    plant: plant.id,
    plantPhoto: req.files[0].filename,
    date: now,
    color,
    delta: 0,
    type: "manual",
  });
  plant.save((d, err) => {
    if (err) {
      console.error(err);
    }
    data.save((d2, err) => {
      if (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  });
});

router.post("/water/:id", multer({ storage }).any(), function(req, res, next) {
  const { color } = req.body;
  const now = new Date();
  Plant.findByIdAndUpdate(
    req.params.id,
    {
      $set: { lastWatering: now },
    },
    { useFindAndModify: false }
  ).then(plant => {
    const delta = deltaE(getRGB(plant.initialColor), getRGB(color));
    const data = new Data({
      plant: plant.id,
      plantPhoto: req.files[0].filename,
      date: now,
      color,
      delta,
      type: "manual",
    });
    console.log(delta, typeof plant);
    Plant.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 100 - delta < 88 ? "Bad" : "Good",
          condition: 100 - delta,
        },
      },
      { useFindAndModify: false }
    ).then(() => {
      data.save((d, err) => {
        if (err) {
          console.error(err);
        }
        res.redirect("/");
      });
    });
  });
});

module.exports = router;
