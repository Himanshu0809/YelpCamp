require('dotenv').config()

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    Campground = require("./models/campgrounds.js"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    Notification=require("./models/notification"),
    seedDB = require("./seeds.js")

//requiring routes
var commentRoutes = require("./routes/comments"),
    reviewRoutes = require("./routes/reviews"),
    campgroundRoutes = require("./routes/campgrounds"),
    userRoutes=require("./routes/user"),
    indexRoutes = require("./routes/index")

var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_12";
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use('/public/img/', express.static('./public/img'));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();   //every time we run the server seeds.js runs


app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(expressSession({
    secret: "This is the yelpcamp secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//User.authenticate comes in with the passportlocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function (req, res, next) {
    res.locals.currentUser = req.user;
    if (req.user) {
        try {
            let user=await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
            res.locals.notifications = user.notifications.reverse();
        } catch (err) {
            console.log("hello");
            console.log(err.message);
        }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use("/", indexRoutes);
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);
app.use("/campgrounds/:slug/reviews", reviewRoutes);

app.listen(process.env.PORT || 3000, function () {
    console.log("YelpCamp has started");
});