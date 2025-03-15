const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;
const path = require('path');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

// app.set('public', path.join(__dirname, 'public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizzRoutes = require('./routes/quizzRoutes');
const authenticate = require('./middleware/authenticate');

app.use("/auth",authRoutes);
app.use("/api",userRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/courses",quizzRoutes);

app.get('/',authenticate,(req,res) => { 
    res.redirect('/api/dashboard'); 
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});