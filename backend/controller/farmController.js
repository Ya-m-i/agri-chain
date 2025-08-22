const asyncHandler = require('express-async-handler')

const Farm = require('../models/farmModel')
const User = require('../models/userModel')

//@desc Get all farms
//@route GET /api/farms
//@access Public
const getFarms = asyncHandler(async (req, res) => {
    const farms = await Farm.find( {user: req.user.id} )

    res.status(200).json(farms)
})

//@desc Create a farm
//@route POST /api/farms
//@access Public
const setFarm = asyncHandler(async (req, res) => {
    if(!req.body.text){
        res.status(400)
        throw new Error('Please add a text field')
    }

    const farm = await Farm.create({
        text: req.body.text,
        username: req.body.text,
    })
    
    res.status(200).json(farm)
})

//@desc Update a farm
//@route PUT /api/farms/:id
//@access Public
const updateFarm = asyncHandler(async (req, res) => {

    const farm = await Farm.findById(req.params.id)

    if(!farm){
        res.status(400)
        throw new Error('Farm is not found')
    }

    const user = await User.findById(req.user.id)
    // check for user
    if(!user){
        res.status(401)
        throw new Error('User is not found!')
    }
    // Make sure the logged in user matches the farm user
    if(farm.user.toString() !== user.id){
        res.status(401)
        throw new Error('User is not authorized!')
    }

    const updatedFarm = await Farm.findByIdAndUpdate(req.params.id, req.
        body, {
            new: true,
        })

    
    res.status(200).json(updatedFarm)
})

//@desc Delete a farm
//@route DELETE /api/farms/:id
//@access Public
const deleteFarm = asyncHandler(async (req, res) => {

    const farm = await Farm.findById(req.params.id)

    if(!farm){
        res.status(400)
        throw new Error('Farm is not found')
    }

    await farm.deleteOne();

    res.status(200).json({ id: req.params.id})
})






module.exports = {
    getFarms,
    setFarm,
    updateFarm,
    deleteFarm,
}