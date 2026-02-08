const express = require('express');
const router = express.Router();
const barangayController = require('../controllers/barangayController');

router.get('/', barangayController.getAllBarangays);
router.get('/:id', barangayController.getBarangayById);

module.exports = router;
