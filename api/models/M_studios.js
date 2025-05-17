const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studioSchema = new Schema({
    studioName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    portfolio: [{
        type: {
            type: String,
            enum: ['image', 'link'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        title: String,
        description: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    mfaSecret: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
studioSchema.index({ email: 1 });
studioSchema.index({ licenseNumber: 1 });

const Studio = mongoose.model('Studio', studioSchema);

module.exports = Studio; 