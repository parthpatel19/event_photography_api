const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "User id is required."],
        },
        user_type: {
            type: String,
            enum: ["user", "admin"],
            required: [true, "User type is required."],
        },
        device_token: {
            type: String,
            required: [true, "Device token is required."],
        },
        device_type: {
            type: String,
            enum: ["ios", "android", "web"],
            required: [true, "Device type is required."],
        },
        auth_token: {
            type: String,
        },
        socket_id: {
            type: String,
            default: null
        },
        chat_room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "chat_rooms",
        },
        is_login: {
            type: Boolean,
            enum: [true, false],
            default: false,
        },
        is_active: {
            type: Boolean,
            enum: [true, false],
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user_sessions", userSessionSchema);