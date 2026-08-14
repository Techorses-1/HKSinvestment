const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');

// Helper: Simple token check
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Admin Registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingAdmin = await Admin.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const admin = new Admin({
            username,
            email,
            password,
            role: role || 'admin'
        });

        await admin.save();

        const token = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email,
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                admin: admin.toJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering admin',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated'
            });
        }

        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email,
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                admin: admin.toJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Admin Profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const admin = await Admin.findById(decoded.id).select('-password -__v');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: admin
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;