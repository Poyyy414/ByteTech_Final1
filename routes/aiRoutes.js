const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/predict-environment", aiController.predictEnvironment);

module.exports = router;
