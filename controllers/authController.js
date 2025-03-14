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

    res.status(201).redirect('/auth/signin');
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
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    // Set the token in a cookie
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/api/dashboard');
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/signin');
}

module.exports = { signup, login, logout };