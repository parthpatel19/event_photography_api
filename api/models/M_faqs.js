const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
        },
        answer: {
            type: String,
        },
        is_active: {
            type: Boolean,
            enum: [true, false],
            default: true
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("faqs", faqSchema);