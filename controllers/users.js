const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.signup = async (req, res) => {
        try {
            let { username, email, password, role } = req.body;
            const newUser = new User({email, username, role: role || 'Student'});
            const registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
            req.login(registeredUser, (err) => {
                if(err) {
                    return next(err);
                }
                req.flash("success", "Welcome to Nexus NITW");
                res.redirect("/events");
            });
        } catch(err) {
            req.flash("error", err.message);
            res.redirect("/signup");
        }
};

module.exports.postLogin = async (req, res) => {
    req.flash("success", "Welcome back to Nexus NITW! You are now logged in");
    let redirectUrl = res.locals.redirectUrl || "/events";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/events");
    });
};