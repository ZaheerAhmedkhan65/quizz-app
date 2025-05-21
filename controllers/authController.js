const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/User');
const sendEmail = require('../utils/emailService'); // You'll need to implement this

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error', 'User already exists with this email! Please choose a different email.');
            return res.redirect('/auth/create-account');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create the user with default role 'user'
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            verificationToken,
            verificationTokenExpires,
            emailVerified: false
        });
        
        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/auth/verify-email?token=${verificationToken}`;
        await sendEmail({
            email: newUser.email,
            subject: 'Verify Your Email',
            message: `Please click on the following link to verify your email: ${verificationUrl}`
        });

        req.flash('success', 'Your account has been created! Please check your gmail inbox to verify your account.');
        return res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error creating your account!');
        return res.redirect('/auth/create-account');
    }
}

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    
    try {
        // Find user by verification token (checking expiration in the query)
        const user = await User.findByVerificationToken(token);
        
        if (!user) {
            req.flash('error', 'Invalid or expired token!');
            return res.redirect('/auth/login');
        }
        
        // Mark email as verified and clear the token
        await User.verifyEmail(user.id);
        
        req.flash('success', 'Email verified successfully!');
        return res.redirect('/auth/login');
        
    } catch (error) {
        console.error('Email verification error:', error);        
        // Or if you prefer JSON response:
        req.flash('error', 'Error verifying email!');
        return res.redirect('/auth/login');
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find the user by email
        const user = await User.findByUsername(username);
        if (!user) {
            req.flash('error', 'Invalid username or password!');
            return res.redirect('/auth/login');
        }
        
        //Check if email is verified
        if (!user.email_verified) {
            req.flash('error', 'Your account was created, but your email is not verified. Please check your gmail inbox for verification instructions.');
            return res.redirect('/auth/verify-email');
        }

        if (user.status === 'blocked') {
            req.flash('error', 'Your account has been blocked. Please contact support.');
            return res.redirect('/auth/login');  
        }

        if (user.status === 'deleted') {
            req.flash('error', 'Your account has been deleted. Please contact support.');
            return res.redirect('/auth/login');  
        }
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            req.flash('error', 'Invalid username or password!');
            return res.redirect('/auth/login');
        }
        
        // Generate JWT with role
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role,
                email: user.email
            }, 
            process.env.SECRET_KEY , 
            { expiresIn: '7d' }
        );
        
        // Set the token in a cookie
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        req.flash('success', 'Login successfully!');
        if(user.role === 'admin') {
            return res.redirect('/api/admin/dashboard');
        }
        return res.redirect('/api/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error logging in!');
        return res.redirect('/auth/login');
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error', 'The user with this Email not found.Please try other email.');
            return res.redirect('/auth/forgot-password');
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        
        await User.setResetToken(user.email, resetToken, resetTokenExpires);

        // Send reset email
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `To reset your password, please click on the following link: ${resetUrl}\nThis link will expire in 30 minutes.`
        });

        req.flash('success', 'Password reset email sent successfully!');
        return res.redirect('/auth/forgot-password');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error sending password reset email!');
        return res.redirect('/auth/forgot-password');
    }
}

const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    console.log('Reset token received:', token); // Log the incoming token
    try {
        const user = await User.findByResetToken(token);
        console.log('user in reset pass', user);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update password and clear reset token
        await User.updatePassword(user.id, hashedPassword);
        req.flash('success', 'Password reset successfully!');
        return res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
}

const refreshToken = async (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
        
        // Verify user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        
        // Issue a new token with renewed expiration
        const newToken = jwt.sign(
            { 
                userId: decoded.userId, 
                username: decoded.username,
                role: user.role 
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '7d' }
        );
        
        res.cookie('token', newToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        
        res.json({ success: true });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'Logout successfully!');
    return res.redirect('/auth/login');
}

module.exports = { 
    signup, 
    verifyEmail,
    login, 
    logout, 
    refreshToken,
    forgotPassword,
    resetPassword
};