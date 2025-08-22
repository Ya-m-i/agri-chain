const mongoose = require('mongoose')

const farmSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
        
    },
    text: {
        type: String,
        required: [true, 'Please add a name']
    },
    
}, 
{
    timestamps: true,
})
    

module.exports = mongoose.model('Farm', farmSchema)