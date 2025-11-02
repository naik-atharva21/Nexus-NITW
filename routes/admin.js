const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isSystemAdmin } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

router.get("/dashboard",
    isLoggedIn,
    isSystemAdmin,
    wrapAsync(adminController.renderDashboard)
);

router.post("/events/:id/approve",
    isLoggedIn,
    isSystemAdmin,
    wrapAsync(adminController.approveEvent)
);

router.post("/events/:id/reject",
    isLoggedIn,
    isSystemAdmin,
    wrapAsync(adminController.rejectEvent)
);

router.post("/users/:id/role",
    isLoggedIn,
    isSystemAdmin,
    wrapAsync(adminController.updateUserRole)
);

router.delete("/users/:id",
    isLoggedIn,
    isSystemAdmin,
    wrapAsync(adminController.deleteUser)
);

module.exports = router;
