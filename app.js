if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const eventRouter = require("./routes/event.js");
const feedbackRouter = require("./routes/feedback.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const migrateEventRegistrations = require("./utils/migrateRegistrations.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/nexus_nitw";

async function main() {
    await mongoose.connect(MONGO_URL);
    await migrateEventRegistrations();
}

main()
    .then(() => {
        console.log("connected to DB");
        const PORT = process.env.PORT || 5000;
        const HOST = "0.0.0.0";
        app.listen(PORT, HOST, () => {
            console.log(`server is listening on ${HOST}:${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.get("/", (req, res) => {
    res.redirect("/events");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/events", eventRouter);
app.use("/events/:id/feedbacks", feedbackRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
    //res.status(statusCode).send(message);
});