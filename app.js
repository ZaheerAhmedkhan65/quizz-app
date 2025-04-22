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
    resave: false,
    saveUninitialized: false, // Changed to false for GDPR compliance
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: process.env.NODE_ENV === 'production' ? new (require('connect-pg-simple')(session))() : null // For production
}));

  // Flash middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = {
      error: req.flash('error'),
      success: req.flash('success')
  };
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