const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    reviewed_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
    },
    review: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('user_reviews', reviewSchema);
