const express = require('express');
const router = express.Router();
const establishmentController = require('../controllers/establishmentController');

// Routes
router.get('/', establishmentController.getAllEstablishments);          // GET establishment/
router.get('/:id', establishmentController.getEstablishmentById);      // GET by ID establishment/1
router.post('/create/establishment', establishmentController.createEstablishment); // CREATE establishment/create
router.put('/:id', establishmentController.updateEstablishment);       // UPDATE    establishment/1
router.delete('/:id', establishmentController.deleteEstablishment);    // DELETE establishment/1

module.exports = router;
