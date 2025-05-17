const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
    {
        content_type: {
            type: String,
            enum: ["terms_and_condition", "privacy_policy", "about"],
            required: [true, "Content type is required."],
        },
        content: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false
        }
    },
    { timestamps: true, versionKey: false }
)

module.exports = mongoose.model("app_contents", contentSchema);
