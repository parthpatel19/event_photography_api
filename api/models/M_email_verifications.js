const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema(
    {
        email_address: {
            type: String,
            trim: true,
            lowercase: true,
            // validate: {
            //   validator: function (v) {
            //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            //   },
            //   message: "Your email is not valid please enter the correct email",
            // },
            required: [true, "Email address is required."],
        },
        otp: {
            type: Number,
            length: [4, "OTP must be 4 digit."],
            default: null,
        },
        is_email_verified: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = verified, false = not verified 
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = deleted, false = not deleted 
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("email_verifications", emailVerificationSchema);