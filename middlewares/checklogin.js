const checkUserLogin = (req, res, next) => {
    if (req.session.user) {
        next(); // User is logged in and has the "user" role, proceed to the next middleware or route handler
    } else {
        req.flash('error_msg', 'Access denied.');
        res.redirect('/login'); // Redirect to login or another appropriate route
    }
};

module.exports = checkUserLogin;