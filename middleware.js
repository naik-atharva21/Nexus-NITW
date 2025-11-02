const Event = require("./models/event.js");
const Feedback = require("./models/feedback.js");
const { eventSchema, feedbackSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to access this page");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isClubAdmin = (req, res, next) => {
    if(!req.isAuthenticated() || req.user.role !== 'ClubAdmin') {
        req.flash("error", "You must be a Club Admin to perform this action");
        return res.redirect("/events");
    }
    next();
}

module.exports.isSystemAdmin = (req, res, next) => {
    if(!req.isAuthenticated() || req.user.role !== 'SystemAdmin') {
        req.flash("error", "You must be a System Admin to perform this action");
        return res.redirect("/events");
    }
    next();
}

module.exports.isStudent = (req, res, next) => {
    if(!req.isAuthenticated() || req.user.role !== 'Student') {
        req.flash("error", "You must be a Student to perform this action");
        return res.redirect("/events");
    }
    next();
}

module.exports.isEventCreator = async (req, res, next) => {
    let { id } = req.params;
    let event = await Event.findById(id);
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    if(!event.createdBy._id.equals(req.user._id)) {
        req.flash("error", "You are not authorized to modify this event!");
        return res.redirect(`/events/${id}`);
    }
    next();
}

module.exports.isFeedbackAuthor = async (req, res, next) => {
    let { id, feedbackId } = req.params;
    let feedback = await Feedback.findById(feedbackId);
    if(!feedback) {
        req.flash("error", "Feedback not found!");
        return res.redirect(`/events/${id}`);
    }
    if(!req.user._id.equals(feedback.author._id)) {
        req.flash("error", "You are not authorized to modify this feedback");
        return res.redirect(`/events/${id}`);
    }
    next();
}

module.exports.validateEvent = (req, res, next) => {
    let { error } = eventSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateFeedback = (req, res, next) => {
    let { error } = feedbackSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}
