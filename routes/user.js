var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");
var Notification = require("../models/notification");

// METHOD  : GET
// ROUTE   : /users
// FUNCTION: List all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});

        res.render('users/index', {
            users: users,
            page: 'users'
        });
    } catch (err) { }
});

//USERS PROFILE
router.get("/users/:id", async function (req, res) {
    await User.findById(req.params.id).populate('followers').exec(async function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("/");
        }
        await Campground.find().where('author.id').equals(foundUser._id).exec(function (err, campgrounds) {
            if (err) {
                req.flash("error", "Something went wrong");
                res.redirect("/");
            }
            res.render("users/show", { user: foundUser, campgrounds: campgrounds });
        })
    })
});

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function (req, res) {
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id); //follow the user requested and add it
        user.save();
        req.flash('success', 'Successfully followed ' + user.username + '!');
        res.redirect('/users/' + req.params.id);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function (req, res) {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: { sort: { "_id": -1 } }    //sorting the notification in descending order i.e. the newest will be seen on the top
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function (req, res) {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);      //${notification.campgroundId} it helps to retrieve campground id of a notification
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

module.exports = router;
