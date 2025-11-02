const Joi = require("joi");

module.exports.eventSchema = Joi.object({
    event: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        date: Joi.date().required(),
        venue: Joi.string().required(),
        capacity: Joi.number().required().min(1)
    }).required()
});

module.exports.feedbackSchema = Joi.object({
    feedback: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comments: Joi.string().required()
    }).required()
});
