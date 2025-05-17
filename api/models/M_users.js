const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      required: true,
      enum: ['studio', 'team_member', 'admin'],
      default: 'team_member',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'role', // This allows us to use inheritance
    versionKey: false,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('users', userSchema);
// // Password hashing middleware
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Password comparison method
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

// // Check if password was changed after token was issued
// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//     if (this.passwordChangedAt) {
//         const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//         return JWTTimestamp < changedTimestamp;
//     }
//     return false;
// };

// // Check if account is locked
// userSchema.methods.isLocked = function() {
//     return !!(this.lockUntil && this.lockUntil > Date.now());
// };

// // Increment login attempts
// userSchema.methods.incrementLoginAttempts = async function() {
//     // If we have a previous lock that has expired, restart at 1
//     if (this.lockUntil && this.lockUntil < Date.now()) {
//         return await this.updateOne({
//             $set: { loginAttempts: 1 },
//             $unset: { lockUntil: 1 }
//         });
//     }
//     // Otherwise increment
//     const updates = { $inc: { loginAttempts: 1 } };
//     // Lock the account if we've reached max attempts
//     if (this.loginAttempts + 1 >= 5) {
//         updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
//     }
//     return await this.updateOne(updates);
// };

// // Create the base User model
// const User = mongoose.model('User', userSchema);

// // Create Studio schema that extends User
// const studioSchema = new Schema({
//     studioName: {
//         type: String,
//         required: [true, "Studio name is required"],
//         trim: true
//     },
//     location: {
//         address: String,
//         city: String,
//         state: String,
//         country: String,
//         zipCode: String
//     },
//     licenseNumber: {
//         type: String,
//         required: [true, "License number is required"],
//         unique: true
//     },
//     portfolio: [{
//         type: {
//             type: String,
//             enum: ['image', 'link'],
//             required: true
//         },
//         url: {
//             type: String,
//             required: true
//         },
//         title: String,
//         description: String
//     }]
// });

// // Create Team Member schema that extends User
// const teamMemberSchema = new Schema({
//     fullName: {
//         type: String,
//         required: [true, "Full name is required"],
//         trim: true
//     },
//     specialization: [{
//         type: String,
//         enum: ['candid', 'portrait', 'wedding', 'event', 'commercial', 'aerial', 'video', 'editing']
//     }],
//     studio: {
//         type: Schema.Types.ObjectId,
//         ref: 'Studio',
//         required: [true, "Studio reference is required"]
//     },
//     assignedEvents: [{
//         type: Schema.Types.ObjectId,
//         ref: 'Event'
//     }]
// });

// // Create the Studio and TeamMember models
// const Studio = User.discriminator('Studio', studioSchema);
// const TeamMember = User.discriminator('TeamMember', teamMemberSchema);

// module.exports = {
//     User,
//     Studio,
//     TeamMember
// };

// userSchema.index({ location: "2dsphere" });
