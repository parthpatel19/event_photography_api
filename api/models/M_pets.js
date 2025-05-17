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

const petsSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        pet_name: {
            type: String,
        },
        pet_type: {
            type: String,
            enum: ["dog", "cat", "reptiles_and_house_pets", "farm_animals", "fish", "horse"],
        },
        pet_breed: {
            type: String,
        },
        location: {
            type: locationSchema,
        },
        address: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female", "both"],
        },
        price: {
            type: Number,
        },
        description: {
            type: String,
        },
        is_adopted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = deleted, false = not deleted 
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = deleted, false = not deleted 
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("pets", petsSchema);

petsSchema.index({ location: "2dsphere" });