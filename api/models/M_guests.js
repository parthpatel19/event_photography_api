const mongoose = require("mongoose");

const guestSessionSchema = new mongoose.Schema(
    {
        device_token: {
            type: String,
            required: [true, "Device token is required."],
        },
        device_type: {
            type: String,
            enum: ["ios", "android", "web"],
            required: [true, "Device type is required."],
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("guests", guestSessionSchema);