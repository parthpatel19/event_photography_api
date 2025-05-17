const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { auth, restrictTo } = require('../middleware/auth');
const Studio = require('../models/M_studios');
const TeamMember = require('../models/M_team_members');
const { sendEmail } = require('../utils/email');
const { generateMFASecret, verifyMFAToken } = require('../utils/mfa');
const {
    registerStudio,
    registerTeamMember,
    login,
    getMe
} = require('../controllers/auth');

// Helper function to sign JWT token
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Studio Registration
router.post('/studio/register', registerStudio);

// Team Member Registration
router.post('/team-member/register', auth, restrictTo('studio'), registerTeamMember);

// Login
router.post('/login', login);

// Get current user
router.get('/me', auth, getMe);

// MFA Verification
router.post('/verify-mfa', async (req, res) => {
    try {
        const { mfaToken, mfaCode } = req.body;

        // Find user with valid MFA token
        const hashedToken = crypto
            .createHash('sha256')
            .update(mfaToken)
            .digest('hex');

        let user = await Studio.findOne({
            mfaToken: hashedToken,
            mfaTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            user = await TeamMember.findOne({
                mfaToken: hashedToken,
                mfaTokenExpires: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        // Verify MFA code
        const isValid = verifyMFAToken(user.mfaSecret, mfaCode);
        if (!isValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid MFA code'
            });
        }

        // Clear MFA token
        user.mfaToken = undefined;
        user.mfaTokenExpires = undefined;
        await user.save();

        // Create token
        const token = signToken(user._id, user instanceof Studio ? 'studio' : 'team_member');

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user instanceof Studio ? 'studio' : 'team_member'
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, role } = req.body;

        let user;
        if (role === 'studio') {
            user = await Studio.findOne({ email });
        } else if (role === 'team_member') {
            user = await TeamMember.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'There is no user with that email address'
            });
        }

        // Generate random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send reset email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}`
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Reset Password
router.patch('/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        let user = await Studio.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            user = await TeamMember.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Create token
        const token = signToken(user._id, user instanceof Studio ? 'studio' : 'team_member');

        res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router; 