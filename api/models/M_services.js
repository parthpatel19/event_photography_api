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

const servicesSchema = new mongoose.Schema(
    {
        service_name: {
            type: String,
        },
        location: {
            type: locationSchema,
        },
        address: {
            type: String,
        },
        price: {
            type: Number,
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

module.exports = mongoose.model("services", servicesSchema);

servicesSchema.index({ location: "2dsphere" });