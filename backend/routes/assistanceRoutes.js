const express = require('express');
const router = express.Router();
const { 
  createAssistance, 
  getAssistances, 
  applyForAssistance, 
  getFarmerApplications, 
  getAllApplications, 
  updateApplicationStatus, 
  updateInventory,
  deleteAssistance
} = require('../controller/assistanceController');

// Basic assistance CRUD
router.route('/')
  .post(createAssistance)
  .get(getAssistances);

router.route('/:id')
  .delete(deleteAssistance);

// Seed Assistance Flow endpoints
router.post('/apply', applyForAssistance);
router.get('/applications', getAllApplications);
router.get('/applications/:farmerId', getFarmerApplications);
router.patch('/applications/:id', updateApplicationStatus);
router.patch('/:id/inventory', updateInventory);

module.exports = router; 