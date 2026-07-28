const User = require("../models/user.js");


module.exports.renderSignupForm =  (req, res) => {
    res.render('users/signup.ejs');
}


module.exports.signup = async (req, res, next) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to the site!");
            res.redirect("/listings");
        });
    } catch (e) {
        console.log("FULL ERROR:", e);       // <-- ye line add karo
        console.log(e.stack);                 // <-- ye bhi
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}


module.exports.renderLoginForm =  (req, res) => {
    res.render('users/login.ejs');
}

module.exports.login = async (req, res) => {
        req.flash("success", "Logged in successfully!");
        res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
}