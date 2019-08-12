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
    async=require("async"),
    nodemailer=require("nodemailer"),
    crypto=require("crypto"),
    Campground = require("./models/campgrounds.js"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds.js")

//requiring routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index")
    
var url=process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_12";
mongoose.connect(url);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();   //every time we run the server seeds.js runs


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

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function () {
    console.log("YelpCamp has started");
});