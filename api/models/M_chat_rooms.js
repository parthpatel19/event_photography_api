const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "User id is required."],
        },
        other_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "Other user id is required."],
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chat_rooms", chatRoomSchema);
