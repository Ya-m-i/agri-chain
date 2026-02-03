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
    },
    // PCIC Application Form data (optional - for full form structure)
    pcicForm: {
        applicationType: { type: String, enum: ['New Application', 'Renewal'], default: 'New Application' },
        totalArea: { type: Number },
        farmerCategory: { type: String, enum: ['Self-Financed', 'Borrowing'], default: 'Self-Financed' },
        lender: { type: String },
        dateOfApplication: { type: Date },
        // Section A - Basic Farmer Information
        applicantName: {
            lastName: { type: String },
            firstName: { type: String },
            middleName: { type: String },
            suffix: { type: String }
        },
        address: {
            street: { type: String },
            barangay: { type: String },
            municipality: { type: String },
            province: { type: String }
        },
        contactNumber: { type: String },
        dateOfBirth: { type: Date },
        sex: { type: String, enum: ['Male', 'Female'] },
        specialSector: [{ type: String }],
        tribe: { type: String },
        civilStatus: { type: String, enum: ['Single', 'Married', 'Widowed', 'Separated'] },
        spouseName: { type: String },
        beneficiary: {
            primary: {
                lastName: { type: String },
                firstName: { type: String },
                middleName: { type: String },
                suffix: { type: String },
                relationship: { type: String },
                birthdate: { type: Date }
            },
            guardian: {
                lastName: { type: String },
                firstName: { type: String },
                middleName: { type: String },
                suffix: { type: String },
                relationship: { type: String },
                birthdate: { type: Date }
            }
        },
        indemnityPaymentOption: { type: String },
        indemnityOther: { type: String },
        // Section B - Farm Information (multiple lots)
        lots: [{
            farmLocation: {
                street: { type: String },
                barangay: { type: String },
                municipality: { type: String },
                province: { type: String }
            },
            boundaries: { north: { type: String }, east: { type: String }, south: { type: String }, west: { type: String } },
            geoRefId: { type: String },
            variety: { type: String },
            plantingMethod: { type: String, enum: ['Direct Seeded', 'Transplanted'] },
            dateOfSowing: { type: Date },
            dateOfPlanting: { type: Date },
            dateOfHarvest: { type: Date },
            numberOfTreesHills: { type: String },
            landCategory: { type: String, enum: ['Irrigated', 'Non-Irrigated'] },
            tenurialStatus: { type: String, enum: ['Owner', 'Lessee'] },
            desiredAmountOfCover: { type: Number },
            lotArea: { type: Number }
        }],
        // Section C - Certification
        certificationConsent: { type: Boolean, default: false },
        deedOfAssignmentConsent: { type: Boolean, default: false },
        signatureImage: { type: String },
        certificationDate: { type: Date },
        // Section D - Source of Premium (FOR PCIC USE ONLY)
        sourceOfPremium: [{ type: String }],
        sourceOfPremiumOther: { type: String }
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