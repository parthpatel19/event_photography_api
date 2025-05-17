const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamMemberSchema = new Schema({
    fullName: {
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
    role: {
        type: String,
        required: true,
        enum: ['photographer', 'videographer', 'drone_operator', 'editor', 'assistant']
    },
    specialization: [{
        type: String,
        enum: ['candid', 'portrait', 'wedding', 'event', 'commercial', 'aerial', 'video', 'editing']
    }],
    certifications: [{
        name: String,
        issuer: String,
        dateObtained: Date,
        expiryDate: Date,
        documentUrl: String
    }],
    experience: {
        years: Number,
        description: String,
        previousWork: [{
            company: String,
            position: String,
            duration: String,
            description: String
        }]
    },
    studio: {
        type: Schema.Types.ObjectId,
        ref: 'Studio',
        required: true
    },
    assignedEvents: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
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

// Indexes for faster queries
teamMemberSchema.index({ email: 1 });
teamMemberSchema.index({ studio: 1 });
teamMemberSchema.index({ role: 1 });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember; 