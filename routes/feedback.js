const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateFeedback, isLoggedIn, isFeedbackAuthor } = require("../middleware.js");
const feedbackController = require("../controllers/feedback.js");

router.post("/",
    isLoggedIn,
    validateFeedback,
    wrapAsync(feedbackController.createFeedback)
);

router.delete("/:feedbackId",
    isLoggedIn,
    isFeedbackAuthor,
    wrapAsync(feedbackController.destroyFeedback)
);

module.exports = router;
