const mongoose = require("mongoose");

const mediaFileImage = new mongoose.Schema([
    {
        file_type: {
            type: String,
            enum: ["image", "video", "voice_note", "audio", "gift"],
            required: [true, "File type is required."],
        },
        file_path: {
            type: String,
        },
        thumbnail: {
            type: String,
        },
    },
]);

const chatSchema = new mongoose.Schema(
    {
        chat_room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "chat_rooms",
            required: [true, "Chat room id is required."],
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "Sender id is required."],
        },
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "Receiver id is required."],
        },
        message_time: {
            type: Date,
        },
        message: {
            type: String,
        },
        message_type: {
            type: String,
            enum: ["text", "image", "video", "voice_note", "audio", "gift"],
            required: [true, "Message type is required."],
        },
        media_file: {
            type: [mediaFileImage],
        },
        is_read: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = read, false = not read
        },
        is_edited: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = edited, false = not edited
        },
        is_deleted: {
            type: String,
            enum: [
                "not_deleted",          // Message is not deleted (default)
                "deleted_for_sender",   // Message deleted by the sender only
                "deleted_for_receiver", // Message deleted by the receiver only
                "deleted_for_all",      // Message deleted for both sender and receiver
            ],
            default: "not_deleted",
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chats", chatSchema);