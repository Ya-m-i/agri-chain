const mongoose = require('mongoose')

const cropInsuranceSchema = mongoose.Schema({
    farmerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Farmer', 
        required: true 
    },
    cropType: { 
        type: String, 
        required: true 
    },
    cropArea: { 
        type: Number, 
        required: true 
    },
    lotNumber: { 
        type: String, 
        required: true 
    },
    lotArea: { 
        type: Number, 
        required: true 
    },
    plantingDate: { 
        type: Date, 
        required: true 
    },
    expectedHarvestDate: { 
        type: Date, 
        required: true 
    },
    insuranceDayLimit: { 
        type: Number, 
        required: true 
    }, // Days from planting date when insurance can be applied
    insuranceDeadline: { 
        type: Date,
        default: null
    }, // Calculated deadline for insurance
    isInsured: { 
        type: Boolean, 
        default: false 
    },
    insuranceDate: { 
        type: Date 
    }, // When the crop was actually insured
    insuranceType: { 
        type: String 
    }, // Type of insurance applied
    premiumAmount: { 
        type: Number 
    },
    agency: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['active', 'expired', 'harvested', 'damaged'], 
        default: 'active' 
    },
    canInsure: { 
        type: Boolean, 
        default: true 
    }, // Whether the crop can still be insured
    notes: { 
        type: String 
    },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // Verification fields
    verificationStatus: {
        type: String,
        enum: ['matched', 'mismatch', 'warning'],
        default: 'matched'
    },
    verificationNotes: {
        type: String
    },
    evidenceImage: {
        type: String // Base64 encoded image or URL
    }
}, {
    timestamps: true,
})

// Pre-save middleware to calculate insurance deadline
cropInsuranceSchema.pre('save', function(next) {
    console.log('Pre-save middleware triggered with data:', {
        plantingDate: this.plantingDate,
        insuranceDayLimit: this.insuranceDayLimit,
        cropType: this.cropType,
        farmerId: this.farmerId
    })
    
    // Always calculate insurance deadline if we have the required data
    if (this.plantingDate && this.insuranceDayLimit) {
        this.insuranceDeadline = new Date(this.plantingDate);
        this.insuranceDeadline.setDate(this.insuranceDeadline.getDate() + this.insuranceDayLimit);
        
        // Check if current date is past the deadline
        const now = new Date();
        if (now > this.insuranceDeadline && !this.isInsured) {
            this.canInsure = false;
        }
        
        console.log('Calculated insurance deadline:', this.insuranceDeadline)
    } else {
        console.log('Missing required data for insurance deadline calculation')
    }
    next();
});

// Method to check if crop can still be insured
cropInsuranceSchema.methods.canStillInsure = function() {
    const now = new Date();
    return !this.isInsured && now <= this.insuranceDeadline;
};

// Method to get remaining days for insurance
cropInsuranceSchema.methods.getRemainingDays = function() {
    const now = new Date();
    const remaining = Math.ceil((this.insuranceDeadline - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
};

module.exports = mongoose.model('CropInsurance', cropInsuranceSchema) 