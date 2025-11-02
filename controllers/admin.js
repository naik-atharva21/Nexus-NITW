const Event = require("../models/event.js");
const User = require("../models/user.js");

module.exports.renderDashboard = async (req, res) => {
    const pendingEvents = await Event.find({ status: 'Pending' }).populate('createdBy');
    const allUsers = await User.find({});
    res.render("admin/dashboard", { pendingEvents, allUsers });
};

module.exports.approveEvent = async (req, res) => {
    let { id } = req.params;
    await Event.findByIdAndUpdate(id, { status: 'Approved' });
    req.flash("success", "Event approved successfully!");
    res.redirect("/admin/dashboard");
};

module.exports.rejectEvent = async (req, res) => {
    let { id } = req.params;
    await Event.findByIdAndUpdate(id, { status: 'Rejected' });
    req.flash("success", "Event rejected!");
    res.redirect("/admin/dashboard");
};

module.exports.updateUserRole = async (req, res) => {
    let { id } = req.params;
    let { role } = req.body;
    
    if(!['Student', 'ClubAdmin', 'SystemAdmin'].includes(role)) {
        req.flash("error", "Invalid role!");
        return res.redirect("/admin/dashboard");
    }
    
    await User.findByIdAndUpdate(id, { role });
    req.flash("success", "User role updated successfully!");
    res.redirect("/admin/dashboard");
};

module.exports.deleteUser = async (req, res) => {
    let { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash("success", "User deleted!");
    res.redirect("/admin/dashboard");
};
