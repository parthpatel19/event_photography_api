const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Studio = require('../models/M_studios');
const TeamMember = require('../models/M_team_members');

const auth = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in. Please log in to get access.'
            });
        }

        // 2) Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        let user;
        if (decoded.role === 'studio') {
            user = await Studio.findById(decoded.id);
        } else if (decoded.role === 'team_member') {
            user = await TeamMember.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // 4) Check if user changed password after the token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: 'error',
                message: 'User recently changed password. Please log in again.'
            });
        }

        // Grant access to protected route
        req.user = user;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please log in again.'
        });
    }
};

// Role-based access control middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

// Studio-specific middleware
const isStudioMember = async (req, res, next) => {
    try {
        if (req.userRole === 'team_member') {
            const teamMember = await TeamMember.findById(req.user._id);
            if (!teamMember.studio.equals(req.params.studioId)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You do not have permission to access this studio'
                });
            }
        }
        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error checking studio membership'
        });
    }
};

module.exports = {
    auth,
    restrictTo,
    isStudioMember
}; 