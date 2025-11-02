const Event = require("../models/event.js");
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

module.exports.index = async (req, res) => {
    let query = {};
    
    if(req.user) {
        if(req.user.role === 'ClubAdmin') {
            query.createdBy = req.user._id;
        } else if(req.user.role === 'Student') {
            query.status = 'Approved';
        } else if(req.user.role === 'SystemAdmin') {
        }
    } else {
        query.status = 'Approved';
    }
    
    const allEvents = await Event.find(query).populate('createdBy');
    res.render("events/index", { allEvents });
};

module.exports.renderNewForm = (req, res) => {      
    res.render("events/new");
};

module.exports.showEvent = async (req, res) => {
    let { id } = req.params;
    const event = await Event.findById(id)
        .populate({
            path: "feedbacks",
            populate: {
                path: "author"
            }
        })
        .populate("createdBy")
        .populate("registrations.user");
    
    if(!event) {
        req.flash("error", `Event not found!`);
        return res.redirect("/events");
    }
    
    const isRegistered = req.user && event.registrations.some(reg => reg.user._id.equals(req.user._id));
    const userRegistration = req.user && event.registrations.find(reg => reg.user._id.equals(req.user._id));
    res.render("events/show", { event, isRegistered, userRegistration });
};

module.exports.createEvent = async (req, res) => {
    let newEvent = new Event(req.body.event);
    newEvent.createdBy = req.user._id;
    
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newEvent.image = {url, filename};
    }
    
    newEvent.status = 'Pending';
    
    await newEvent.save();
    req.flash("success", "Event proposal submitted! Waiting for admin approval.");
    res.redirect("/events");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const event = await Event.findById(id);

    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }

    if (event.image && event.image.url) {
        let originalImageUrl = event.image.url;
        event.image.url = originalImageUrl.replace("/upload", "/upload/w_250");
    }
    res.render("events/edit", { event });
};

module.exports.updateEvent = async (req, res) => {
    let updatedEvent = req.body.event;
    if(!req.body.event) {
        throw new ExpressError(400, "Send valid data for event");
    }
    let { id } = req.params;
    let event = await Event.findByIdAndUpdate(id, updatedEvent, { runValidators: true });
    
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        event.image = { url, filename };
        await event.save();
    }
    req.flash("success", "Event Updated!");
    res.redirect(`/events/${id}`);
};

module.exports.destroyEvent = async (req, res) => {
    let { id } = req.params;
    await Event.findByIdAndDelete(id);
    req.flash("success", "Event Deleted");
    res.redirect("/events");
};

module.exports.registerForEvent = async (req, res) => {
    let { id } = req.params;
    let event = await Event.findById(id);
    
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    
    const alreadyRegistered = event.registrations.some(reg => reg.user.equals(req.user._id));
    if(alreadyRegistered) {
        req.flash("error", "You are already registered for this event!");
        return res.redirect(`/events/${id}`);
    }
    
    if(event.registrations.length >= event.capacity) {
        req.flash("error", "Event is full!");
        return res.redirect(`/events/${id}`);
    }
    
    const ticketToken = uuidv4();
    event.registrations.push({
        user: req.user._id,
        ticketToken: ticketToken
    });
    await event.save();
    req.flash("success", "Successfully registered for the event! Your ticket has been generated.");
    res.redirect(`/events/${id}`);
};

module.exports.unregisterFromEvent = async (req, res) => {
    let { id } = req.params;
    let event = await Event.findById(id);
    
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    
    event.registrations = event.registrations.filter(reg => !reg.user.equals(req.user._id));
    await event.save();
    req.flash("success", "Unregistered from event!");
    res.redirect(`/events/${id}`);
};

module.exports.viewTicket = async (req, res) => {
    let { id } = req.params;
    const event = await Event.findById(id).populate("createdBy");
    
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    
    const registration = event.registrations.find(reg => reg.user.equals(req.user._id));
    
    if(!registration) {
        req.flash("error", "You are not registered for this event!");
        return res.redirect(`/events/${id}`);
    }
    
    const qrData = JSON.stringify({
        eventId: event._id,
        ticketToken: registration.ticketToken,
        userId: req.user._id
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    res.render("events/ticket", { event, registration, qrCode });
};

module.exports.renderCheckIn = async (req, res) => {
    let { id } = req.params;
    const event = await Event.findById(id).populate("registrations.user");
    
    if(!event) {
        req.flash("error", "Event not found!");
        return res.redirect("/events");
    }
    
    res.render("events/checkin", { event });
};

module.exports.checkInAttendee = async (req, res) => {
    let { id } = req.params;
    let { ticketToken } = req.body;
    
    const event = await Event.findById(id).populate("registrations.user");
    
    if(!event) {
        return res.status(404).json({ success: false, message: "Event not found!" });
    }
    
    const registration = event.registrations.find(reg => reg.ticketToken === ticketToken);
    
    if(!registration) {
        return res.status(404).json({ success: false, message: "Invalid ticket!" });
    }
    
    if(registration.attended) {
        return res.status(400).json({ 
            success: false, 
            message: "Already checked in!", 
            attendee: registration.user.username,
            checkedInAt: registration.checkedInAt
        });
    }
    
    registration.attended = true;
    registration.checkedInAt = new Date();
    await event.save();
    
    res.json({ 
        success: true, 
        message: "Check-in successful!", 
        attendee: registration.user.username 
    });
};
