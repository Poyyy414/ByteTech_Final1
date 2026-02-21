const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/create/feedback',              feedbackController.createFeedback);
router.get('/feedback',               feedbackController.getAllFeedback);
router.get('/eedback/summary',        feedbackController.getFeedbackSummary);
router.get('/feedback/type/:type',     feedbackController.getFeedbackByType);
router.get('/feedback/:id',            feedbackController.getFeedbackById);
router.delete('/feedback/:id',         feedbackController.deleteFeedback);

module.exports = router;