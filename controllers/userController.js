const User = require('../models/User');
const Save_Job = require('../models/Save_Job');

const jwt = require('jsonwebtoken');
const multer = require('multer');

const bcrypt = require('bcrypt');

// const flash = require('connect-flash');
const { body, validationResult } = require('express-validator');
exports.RegsitrationForm = (req, res) => {
    res.render('register', { errors: req.flash('errors') });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'users_images');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const user_upload = multer({ storage: storage });
exports.user_upload = user_upload;


const validateRegisterUser = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 5, max: 7 }).withMessage('Password must be between 5 and 7 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
    .matches(/\d/).withMessage('Password must contain at least one number')
];

exports.registerUser = [
    validateRegisterUser,
    async(req, res) => {
        // console.log('Request Body:', req.body); // Log request body

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // console.log('Validation Errors:', errors.array()); // Log validation errors
            req.flash('errors', errors.array());
            return res.render('register', { errors: req.flash('errors') });
        }

        try {
            // Process registration
            const { username, email, password } = req.body;
            const user_image = req.file ? req.file.path : null;
            const newUser = new User({ username, email, password, user_image });
            await newUser.save();
            req.flash('success', 'Registration successful! You can now log in.');
            res.redirect('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            req.flash('errors', [{ msg: 'Registration failed' }]);
            res.redirect('/register');
        }
    }
];

exports.LoginForm = (req, res) => {
    res.render('login', { success: null, errors: req.flash('errors') });
}
const validateLoginUser = [
    body('email').notEmpty().withMessage('Enter email address'),
    body('password').notEmpty().withMessage('Password is required')
];
exports.loginUser = [
    validateLoginUser,
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Store validation errors in flash
            req.flash('errors', errors.array());
            // res.redirect('/login');
            // Render the form with validation errors
            return res.render('login', { errors: req.flash('errors') });
        }

        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                req.flash('errors', [{ msg: 'User not found' }]);
                return res.render('login', { errors: req.flash('errors') });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('errors', [{ msg: 'Password does not match' }]);
                return res.render('login', { errors: req.flash('errors') });
            }

            // User authenticated, generate JWT token
            const payload = {
                user: {
                    id: user.id,
                    // Optionally include other user data
                }
            };


            // Sign the token
            jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: '1d' }, (err, token) => {
                if (err) throw err;
                res.cookie('jwt', token, { httpOnly: true }); // Set token in cookie (recommended)
                // Alternatively, send token in response header
                // res.header('Authorization', `Bearer ${token}`).json({ token }); 

                res.redirect('/profile'); // Redirect user to user dashboard

            });

        } catch (error) {
            console.error('Error during login:', error);
            req.flash('errors', [{ msg: 'Login failed' }]);
            res.redirect('/login');
            // res.render('login_form', { errors: req.flash('errors') });
        }
    }
];

exports.showUserProfile = async(req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send({ error: 'No token provided, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await User.findById(decoded.user.id);
        // console.log(user);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        req.session.user = user
            // console.log(req.session.user);
        res.redirect('/');

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ error: 'Token is not valid' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ error: 'Token has expired' });
        } else {
            res.status(500).send({ error: 'Failed to load profile', details: error.message });
        }
    }
};
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error while destroying session:', err);
            return res.status(500).send('Logout failed');
        }
        // Redirect to the login page after successfully destroying the session
        res.clearCookie('jwt'); // Clear the JWT cookie
        res.redirect('/login');
    });
    // res.redirect('/login');
};

exports.UserProfile = async(req, res) => {
    const user = req.session.user;
    res.render('index', {
        user,
        title: "User Profile",
        mainView: 'profile'
    })
}

exports.saveUserJobs = async(req, res) => {
    const user = req.session.user;
    const save_jobs = await Save_Job.find({ user: user._id })
    res.render('index', {
        save_jobs,
        title: "Save Jobs",
        mainView: 'save_jobs'
    })
}