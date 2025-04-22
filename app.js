const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = 3000;
const path = require('path');

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET_KEY || 'fallback-secret-key-for-development-only',
    resave: true,  // Changed from false to true
    saveUninitialized: true,  // Changed from false to true
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    },
    store: process.env.NODE_ENV === 'production' 
        ? new (require('connect-pg-simple')(session))() 
        : new (require('memorystore')(session))({
            checkPeriod: 86400000
        })
}));

app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

  // Flash middleware
app.use(flash());

// Make flash messages available to all views
// Replace your current flash middleware with this:
app.use((req, res, next) => {
    // Store the flash messages before they're consumed
    const flashMsgs = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    
    // Make available to templates
    res.locals.success_msg = flashMsgs.success;
    res.locals.error_msg = flashMsgs.error;
    next();
});

app.set('public', path.join(__dirname, 'public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizzRoutes = require('./routes/quizzRoutes');
const geminiRoutes = require("./routes/geminiRoute");

const authenticate = require('./middleware/authenticate');
const { title } = require('process');

app.use("/auth",authRoutes);
app.use("/api",userRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/courses",quizzRoutes);
app.use("/api/gemini", geminiRoutes);

app.get('/',authenticate,(req,res) => { 
    res.redirect('/api/dashboard'); 
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});