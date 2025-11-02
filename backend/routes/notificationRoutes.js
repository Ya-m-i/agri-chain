const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  deleteNotification,
  clearNotifications
} = require('../controller/notificationController');

// Create a notification
// POST /api/notifications
router.post('/', createNotification);

// Delete a specific notification (must come before other routes with :id)
// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

// Admin routes (no recipientId)
// GET /api/notifications/admin
router.get('/admin', (req, res) => {
  req.params = { recipientType: 'admin', recipientId: undefined };
  return getNotifications(req, res);
});
// GET /api/notifications/admin/count
router.get('/admin/count', (req, res) => {
  req.params = { recipientType: 'admin', recipientId: undefined };
  return getUnreadCount(req, res);
});
// PATCH /api/notifications/admin/read
router.patch('/admin/read', (req, res) => {
  req.params = { recipientType: 'admin', recipientId: undefined };
  return markAsRead(req, res);
});
// DELETE /api/notifications/admin/clear
router.delete('/admin/clear', (req, res) => {
  req.params = { recipientType: 'admin', recipientId: undefined };
  return clearNotifications(req, res);
});

// Farmer routes (with recipientId)
// GET /api/notifications/farmer/:farmerId
router.get('/farmer/:farmerId', (req, res) => {
  req.params = { recipientType: 'farmer', recipientId: req.params.farmerId };
  return getNotifications(req, res);
});
// GET /api/notifications/farmer/:farmerId/count
router.get('/farmer/:farmerId/count', (req, res) => {
  req.params = { recipientType: 'farmer', recipientId: req.params.farmerId };
  return getUnreadCount(req, res);
});
// PATCH /api/notifications/farmer/:farmerId/read
router.patch('/farmer/:farmerId/read', (req, res) => {
  req.params = { recipientType: 'farmer', recipientId: req.params.farmerId };
  return markAsRead(req, res);
});
// DELETE /api/notifications/farmer/:farmerId/clear
router.delete('/farmer/:farmerId/clear', (req, res) => {
  req.params = { recipientType: 'farmer', recipientId: req.params.farmerId };
  return clearNotifications(req, res);
});

module.exports = router;

