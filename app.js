const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./config/db');
const flash = require('connect-flash');
const app = express();
const path = require('path');
require('dotenv').config();
require('./config/passport');

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

// Create MySQL session store
const sessionStore = new MySQLStore({
  expiration: 86400000,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // changing from strict to none on production
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport and flash middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
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
const pastpaperRoutes = require("./routes/pastpaperRoutes");
const userCourseRoutes = require("./routes/userCourseRoutes.js");
const gdbRoutes = require("./routes/gdbRoutes.js");
const assignmentRoutes = require("./routes/assignmentRoutes.js");

const {bindUser, authenticate, isAdmin} = require('./middleware/authenticate');

app.use(bindUser);

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.path = req.path;
    next();
});

app.get('/',(req,res) => { 
    if(req.user){
        return res.redirect('/dashboard');
    }
    res.render('index', { title: "Home" }); 
});

app.use("/",publicRoutes);
app.use("/auth",authRoutes);
app.use("/", lectureRoutes);
app.use("/courses",courseRoutes);
app.use("/past-papers",pastpaperRoutes);
app.use("/gdb", gdbRoutes);
app.use("/assignments", assignmentRoutes);
app.use(authenticate);
app.use("/", userRoutes);
app.use("/courses", userCourseRoutes);
app.use("/",quizRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/todo",todoRoutes);
app.use("/notifications",notificationRoutes);
app.use(isAdmin)
app.use("/admin",adminRoutes);

app.use((req, res) => {
    res.status(404).render('notfound', { title: "404" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});