const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isClubAdmin, isEventCreator, validateEvent } = require("../middleware.js");
const eventController = require("../controllers/events.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(eventController.index))
    .post(
        isLoggedIn,
        isClubAdmin,
        upload.single("event[image]"),
        validateEvent,
        wrapAsync(eventController.createEvent)
    );

router.get("/new",
    isLoggedIn,
    isClubAdmin,
    eventController.renderNewForm
);
    
router
    .route("/:id")
    .get(
        wrapAsync(eventController.showEvent)
    )
    .put(
        isLoggedIn,
        isClubAdmin,
        isEventCreator,
        upload.single("event[image]"),
        validateEvent,
        wrapAsync(eventController.updateEvent)
    )
    .delete(
        isLoggedIn,
        isClubAdmin,
        isEventCreator,
        wrapAsync(eventController.destroyEvent)
    );

router.get("/:id/edit",
    isLoggedIn,
    isClubAdmin,
    isEventCreator,
    wrapAsync(eventController.renderEditForm)
);

router.post("/:id/register",
    isLoggedIn,
    wrapAsync(eventController.registerForEvent)
);

router.post("/:id/unregister",
    isLoggedIn,
    wrapAsync(eventController.unregisterFromEvent)
);

router.get("/:id/ticket",
    isLoggedIn,
    wrapAsync(eventController.viewTicket)
);

router.get("/:id/checkin",
    isLoggedIn,
    isClubAdmin,
    wrapAsync(eventController.renderCheckIn)
);

router.post("/:id/checkin",
    isLoggedIn,
    isClubAdmin,
    wrapAsync(eventController.checkInAttendee)
);

module.exports = router;
