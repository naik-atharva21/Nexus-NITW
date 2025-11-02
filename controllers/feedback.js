const Event = require("../models/event.js");
const Feedback = require("../models/feedback.js");

module.exports.createFeedback = async (req, res) => {
    let event = await Event.findById(req.params.id);
    
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    
    let newFeedback = new Feedback(req.body.feedback);
    newFeedback.author = req.user._id;
    event.feedbacks.push(newFeedback);

    await newFeedback.save();
    await event.save();

    req.flash("success", "Feedback submitted successfully!");
    res.redirect(`/events/${req.params.id}`);
};

module.exports.destroyFeedback = async (req, res) => {
    let { id, feedbackId } = req.params;
    await Event.findByIdAndUpdate(id, {$pull: {feedbacks: feedbackId}});
    await Feedback.findByIdAndDelete(feedbackId);
    req.flash("success", "Feedback Deleted!");
    res.redirect(`/events/${id}`);  
};
