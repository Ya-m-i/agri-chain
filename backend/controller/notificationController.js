const Notification = require('../models/notificationModel');
const mongoose = require('mongoose');

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  try {
    // Check if it's already an ObjectId
    if (id instanceof mongoose.Types.ObjectId) return id;
    // Check if it's a valid ObjectId string
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    // If not valid, return as-is (might be a string ID from another source)
    return id;
  } catch (error) {
    return id;
  }
};

// @desc    Get notifications for admin or farmer
// @route   GET /api/notifications/:recipientType/:recipientId?
// @access  Public
const getNotifications = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;
    const { read } = req.query; // Optional filter: ?read=true or ?read=false

    if (!recipientType || !['admin', 'farmer'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type. Must be "admin" or "farmer"' });
    }

    const query = { recipientType };
    
    if (recipientType === 'farmer') {
      if (!recipientId) {
        return res.status(400).json({ message: 'Farmer ID is required for farmer notifications' });
      }
      // Convert string ID to ObjectId for proper MongoDB query
      query.recipientId = toObjectId(recipientId);
    } else {
      // For admin, recipientId should be null
      query.recipientId = null;
    }

    // Optional read filter
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .limit(100); // Limit to latest 100 notifications

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/:recipientType/:recipientId?/count
// @access  Public
const getUnreadCount = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;

    if (!recipientType || !['admin', 'farmer'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type. Must be "admin" or "farmer"' });
    }

    const query = { recipientType, read: false };
    
    if (recipientType === 'farmer') {
      if (!recipientId) {
        return res.status(400).json({ message: 'Farmer ID is required for farmer notifications' });
      }
      // Convert string ID to ObjectId for proper MongoDB query
      query.recipientId = toObjectId(recipientId);
    } else {
      query.recipientId = null;
    }

    const count = await Notification.countDocuments(query);

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Public
const createNotification = async (req, res) => {
  try {
    const {
      recipientType,
      recipientId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId
    } = req.body;

    // Validation
    if (!recipientType || !['admin', 'farmer'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type. Must be "admin" or "farmer"' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    if (recipientType === 'farmer' && !recipientId) {
      return res.status(400).json({ message: 'Farmer ID is required for farmer notifications' });
    }

    const notification = await Notification.create({
      recipientType,
      recipientId: recipientType === 'admin' ? null : recipientId,
      type: type || 'info',
      title,
      message,
      relatedEntityType: relatedEntityType || 'general',
      relatedEntityId: relatedEntityId || null,
      read: false,
      timestamp: new Date()
    });

    // Emit Socket.IO event for real-time notification delivery
    // Get io instance from app (set in server.js)
    const io = req.app.get('io');
    if (io) {
      if (recipientType === 'farmer' && recipientId) {
        // Send to specific farmer room
        io.to(`farmer-${recipientId}`).emit('new-notification', notification);
        console.log(`📨 Notification sent to farmer room: farmer-${recipientId}`);
      } else if (recipientType === 'admin') {
        // Send to admin room
        io.to('admin-room').emit('new-notification', notification);
        console.log('📨 Notification sent to admin room');
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PATCH /api/notifications/:recipientType/:recipientId?/read
// @access  Public
const markAsRead = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;
    const { notificationIds } = req.body; // Optional array of specific notification IDs

    if (!recipientType || !['admin', 'farmer'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type. Must be "admin" or "farmer"' });
    }

    const query = { recipientType };
    
    if (recipientType === 'farmer') {
      if (!recipientId) {
        return res.status(400).json({ message: 'Farmer ID is required for farmer notifications' });
      }
      // Convert string ID to ObjectId for proper MongoDB query
      query.recipientId = toObjectId(recipientId);
    } else {
      query.recipientId = null;
    }

    // If specific notification IDs provided, only mark those as read
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Convert string IDs to ObjectIds for proper MongoDB query
      const objectIds = notificationIds
        .map(id => toObjectId(id))
        .filter(id => id && mongoose.Types.ObjectId.isValid(id));
      if (objectIds.length > 0) {
        query._id = { $in: objectIds };
      }
    }

    const result = await Notification.updateMany(query, { read: true });

    res.status(200).json({ 
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Public
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications for a recipient
// @route   DELETE /api/notifications/:recipientType/:recipientId?/clear
// @access  Public
const clearNotifications = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;

    if (!recipientType || !['admin', 'farmer'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type. Must be "admin" or "farmer"' });
    }

    const query = { recipientType };
    
    if (recipientType === 'farmer') {
      if (!recipientId) {
        return res.status(400).json({ message: 'Farmer ID is required for farmer notifications' });
      }
      // Convert string ID to ObjectId for proper MongoDB query
      query.recipientId = toObjectId(recipientId);
    } else {
      query.recipientId = null;
    }

    const result = await Notification.deleteMany(query);

    res.status(200).json({ 
      message: 'All notifications cleared',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  deleteNotification,
  clearNotifications
};

