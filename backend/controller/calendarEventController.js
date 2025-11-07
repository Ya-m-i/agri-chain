const asyncHandler = require('express-async-handler')
const CalendarEvent = require('../models/calendarEventModel')

// @desc    Get all calendar events for a farmer
// @route   GET /api/calendar-events/:farmerId
// @access  Public
const getCalendarEvents = asyncHandler(async (req, res) => {
    const { farmerId } = req.params
    
    if (!farmerId) {
        res.status(400)
        throw new Error('Farmer ID is required')
    }

    const events = await CalendarEvent.find({ farmerId })
        .sort({ date: 1 }) // Sort by date ascending
    
    res.status(200).json(events)
})

// @desc    Create a new calendar event
// @route   POST /api/calendar-events
// @access  Public
const createCalendarEvent = asyncHandler(async (req, res) => {
    const { farmerId, title, date, type, notes } = req.body

    // Validation
    if (!farmerId || !title || !date) {
        res.status(400)
        throw new Error('Farmer ID, title, and date are required')
    }

    // Check for duplicate event (same farmer, title, and date)
    const eventDate = new Date(date)
    const startOfDay = new Date(eventDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(eventDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const existingEvent = await CalendarEvent.findOne({
        farmerId,
        title: title.trim(),
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    })

    if (existingEvent) {
        res.status(409) // Conflict status
        throw new Error('An event with the same title and date already exists')
    }

    // Color mapping based on type
    const colorMap = {
        planting: 'blue',
        fertilizer: 'yellow',
        harvest: 'green',
        insurance: 'red',
        other: 'gray'
    }

    const event = await CalendarEvent.create({
        farmerId,
        title: title.trim(),
        date: new Date(date),
        type: type || 'other',
        color: colorMap[type] || 'gray',
        notes: notes || ''
    })

    res.status(201).json(event)
})

// @desc    Update a calendar event
// @route   PUT /api/calendar-events/:id
// @access  Public
const updateCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title, date, type, notes } = req.body

    const event = await CalendarEvent.findById(id)

    if (!event) {
        res.status(404)
        throw new Error('Event not found')
    }

    // Check for duplicate if title or date is being changed
    if (title || date) {
        const checkDate = date ? new Date(date) : event.date
        const checkTitle = title ? title.trim() : event.title
        
        const startOfDay = new Date(checkDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(checkDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        const existingEvent = await CalendarEvent.findOne({
            _id: { $ne: id }, // Exclude current event
            farmerId: event.farmerId,
            title: checkTitle,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })

        if (existingEvent) {
            res.status(409)
            throw new Error('An event with the same title and date already exists')
        }
    }

    // Color mapping
    const colorMap = {
        planting: 'blue',
        fertilizer: 'yellow',
        harvest: 'green',
        insurance: 'red',
        other: 'gray'
    }

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
        id,
        {
            ...(title && { title: title.trim() }),
            ...(date && { date: new Date(date) }),
            ...(type && { 
                type,
                color: colorMap[type] || 'gray'
            }),
            ...(notes !== undefined && { notes: notes.trim() })
        },
        { new: true }
    )

    res.status(200).json(updatedEvent)
})

// @desc    Delete a calendar event
// @route   DELETE /api/calendar-events/:id
// @access  Public
const deleteCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params

    const event = await CalendarEvent.findById(id)

    if (!event) {
        res.status(404)
        throw new Error('Event not found')
    }

    await CalendarEvent.findByIdAndDelete(id)

    res.status(200).json({ 
        message: 'Event deleted successfully',
        id 
    })
})

// @desc    Get calendar events by date range
// @route   GET /api/calendar-events/:farmerId/range
// @access  Public
const getCalendarEventsByRange = asyncHandler(async (req, res) => {
    const { farmerId } = req.params
    const { startDate, endDate } = req.query

    if (!farmerId) {
        res.status(400)
        throw new Error('Farmer ID is required')
    }

    if (!startDate || !endDate) {
        res.status(400)
        throw new Error('Start date and end date are required')
    }

    const events = await CalendarEvent.find({
        farmerId,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: 1 })

    res.status(200).json(events)
})

module.exports = {
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEventsByRange
}

