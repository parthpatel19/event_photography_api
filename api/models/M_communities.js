const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: [true, "coordinates is required."], // [latitude, longitude]
        },
    },
    { _id: false }
);

const communitiesSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        location: {
            type: locationSchema,
        },
        address: {
            type: String,
        },
        description: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = deleted, false = not deleted 
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("communities", communitiesSchema);

communitiesSchema.index({ location: "2dsphere" });