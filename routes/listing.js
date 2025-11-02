const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index))   //Index Route
    .post(                                     //Create Route
        isLoggedIn,
        validateListing,
        upload.single("listing[image]"),
        wrapAsync(listingController.createListing)
    );

//New Route - put this above show route to avoid new being treated as an id
router.get("/new",
    isLoggedIn,
    listingController.renderNewForm
);
    
router
    .route("/:id")
    .get(                                 //Show Route
        wrapAsync(listingController.showListing)
    )
    .put(                                //Update Route
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        wrapAsync(listingController.updateListing),
        validateListing,
    )
    .delete(                             //Destroy Route
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;