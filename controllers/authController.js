const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const JWT_SECRET = '2a991f724f33ef14aacc3529a2a8e5747215370b96ca9b77478d76d5733fa7ee3ae8ff9b48c3b0b062b2f838d961e66d29b9cba53119c19f468ee46290c67142';

const signup = async (req, res) => {
    const { username,email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await User.create(username, email,hashedPassword);

    res.status(201).redirect('/auth/login');
}
const login = async (req, res) => {
    const { username, password } = req.body;
    // Find the user
    const user = await User.findByUsername(username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    const sessionId = Date.now().toString();
    new Date().getTime()
   console.log(sessionId);
    // Set the session ID in a cookie
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: true, sameSite: 'strict' });
    // Set the token in a cookie
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict',maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect('/api/dashboard');
}

const refreshToken = async (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        // Issue a new token with renewed expiration
        const newToken = jwt.sign(
            { userId: decoded.userId, username: decoded.username }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.cookie('token', newToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'strict' 
        });
        console.log("token newed :",newToken)
        res.json({ success: true });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
}

module.exports = { signup, login, logout, refreshToken };