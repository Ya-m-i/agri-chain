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

// Get notifications for admin or farmer
// GET /api/notifications/admin
// GET /api/notifications/farmer/:farmerId
router.get('/:recipientType/:recipientId?', getNotifications);

// Get unread count
// GET /api/notifications/admin/count
// GET /api/notifications/farmer/:farmerId/count
router.get('/:recipientType/:recipientId?/count', getUnreadCount);

// Create a notification
// POST /api/notifications
router.post('/', createNotification);

// Mark notifications as read
// PATCH /api/notifications/admin/read
// PATCH /api/notifications/farmer/:farmerId/read
router.patch('/:recipientType/:recipientId?/read', markAsRead);

// Delete a specific notification
// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

// Clear all notifications
// DELETE /api/notifications/admin/clear
// DELETE /api/notifications/farmer/:farmerId/clear
router.delete('/:recipientType/:recipientId?/clear', clearNotifications);

module.exports = router;

