require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const userRoute = require('./routes/userRoute');
const scrapeRoute = require('./routes/scrapeRoute');
mongoose.connect(process.env.DATABASE_NAME)
    .then(() => console.log("Successfully Connected With DB"))
    .catch(() => console.log("Failed to Connect With DB"));
const app = express();

// Middleware setup
app.use('/public', express.static('public'));
app.use('/users_images', express.static(path.join(__dirname, 'users_images')));
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // Add this to handle JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Connect to database


// Session setup
// Use environment variable for security
const SECRET = '1e1df736'; // Consider using process.env.SECRET for better security
app.use(
    session({
        secret: SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: false
    })
);
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
// console.log(req.session.user);
app.get("/", (req, res) => {
    // console.log(req.session.user);
    res.render('index', {
        title: 'Home',
        mainView: 'main'
    });
});
app.get("/about", (req, res) => {
    res.render('index', {
        title: 'About',
        mainView: 'about'
    });
});
app.get("/contact", (req, res) => {
    res.render('index', {
        title: 'Contact Us',
        mainView: 'contact_us'
    });
});

app.use(flash());
// Use routes
app.use(userRoute);
app.use(scrapeRoute);

// Define routes

// Start server
const port_no = process.env.PORT || 3000; // Default to 3000 if PORT not set
app.listen(port_no, () => {
    console.log(`Server Runs On Port ${port_no}`);
});