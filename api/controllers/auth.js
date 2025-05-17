const jwt = require('jsonwebtoken');
const { User, Studio, TeamMember } = require('../models/M_users');

// Helper function to sign JWT token
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Studio Registration
exports.registerStudio = async (req, res) => {
    try {
        const studio = await Studio.create({
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            studioName: req.body.studioName,
            location: req.body.location,
            licenseNumber: req.body.licenseNumber
        });

        // Create token
        const token = signToken(studio._id, 'studio');

        res.status(201).json({
            status: 'success',
            token,
            data: {
                studio: {
                    id: studio._id,
                    studioName: studio.studioName,
                    email: studio.email
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Team Member Registration
exports.registerTeamMember = async (req, res) => {
    try {
        const teamMember = await TeamMember.create({
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            fullName: req.body.fullName,
            specialization: req.body.specialization,
            studio: req.body.studio
        });

        // Create token
        const token = signToken(teamMember._id, 'team_member');

        res.status(201).json({
            status: 'success',
            token,
            data: {
                teamMember: {
                    id: teamMember._id,
                    fullName: teamMember.fullName,
                    email: teamMember.email
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Check if user exists and password is correct
        let user;
        if (role === 'studio') {
            user = await Studio.findOne({ email }).select('+password');
        } else if (role === 'team_member') {
            user = await TeamMember.findOne({ email }).select('+password');
        }

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password'
            });
        }

        // Create token
        const token = signToken(user._id, role);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        let user;
        if (req.userRole === 'studio') {
            user = await Studio.findById(req.user._id);
        } else if (req.userRole === 'team_member') {
            user = await TeamMember.findById(req.user._id);
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 