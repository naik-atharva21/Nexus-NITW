const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Feedback = require("./feedback.js");

const registrationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ticketToken: {
        type: String,
        required: true,
        unique: true
    },
    attended: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date
    }
}, { timestamps: true });

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    date: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    feedbacks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Feedback"
        }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    registrations: [registrationSchema]
}, { timestamps: true });

eventSchema.post("findOneAndDelete", async (event) => {
    if(event) {
        await Feedback.deleteMany({_id: {$in: event.feedbacks}});
    }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
