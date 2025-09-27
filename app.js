const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./config/db'); // Import your MySQL pool
const flash = require('connect-flash');
const app = express();
const path = require('path');
require('dotenv').config();

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

// Create MySQL session store
const sessionStore = new MySQLStore({
  expiration: 86400000, // 1 day in milliseconds
  createDatabaseTable: true, // Will create sessions table if it doesn't exist
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

app.use(session({
    secret: process.env.SECRET_KEY || 'fallback-secret-key-for-development-only',
    resave: false,  // Changed from false to true
    saveUninitialized: false,  // Changed from false to true
    store: sessionStore,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    // console.log('Session ID:', req.sessionID);
    // console.log('Session data:', req.session);
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
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const geminiRoutes = require("./routes/geminiRoute");
const todoRoutes = require("./routes/todoRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const lectureRoutes = require("./routes/lectureRoutes");

const {bindUser, authenticate, isAdmin} = require('./middleware/authenticate');

app.use(bindUser);

app.get('/',(req,res) => { 
    res.render('index', { title: "Home", user: req.user || null, path: req.path }); 
});

app.use("/",publicRoutes);

app.use("/auth",authRoutes);

app.use("/", userRoutes);
app.use("/", lectureRoutes);
app.use("/courses",courseRoutes);
app.use(authenticate);
app.use("/",quizRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/todo",todoRoutes);
app.use("/api/notifications",notificationRoutes);
app.use(isAdmin)
app.use("/admin",adminRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});