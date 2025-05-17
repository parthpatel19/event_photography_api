const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        noti_title: {
            type: String,
            required: true,
        },
        noti_msg: {
            type: String,
        },
        noti_for: {
            type: String,
            enum: [],
        },
        noti_date: {
            type: Date,
            required: [true, "Notification date is required."],
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("notifications", notificationSchema);