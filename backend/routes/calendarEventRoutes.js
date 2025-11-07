const express = require('express')
const router = express.Router()
const {
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEventsByRange
} = require('../controller/calendarEventController')

// Get all events for a farmer
router.get('/:farmerId', getCalendarEvents)

// Get events by date range
router.get('/:farmerId/range', getCalendarEventsByRange)

// Create a new event
router.post('/', createCalendarEvent)

// Update an event
router.put('/:id', updateCalendarEvent)

// Delete an event
router.delete('/:id', deleteCalendarEvent)

module.exports = router

