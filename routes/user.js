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

// METHOD  : GET
// ROUTE   : /users/:id
// FUNCTION: Show information page
router.get('/users/:id', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id);
        const campgrounds = await Campground.find()
            .where('author.id')
            .equals(foundUser._id)
            .exec();

        res.render('users/show', { user: foundUser, campgrounds });
    } catch (err) {
        req.flash('error', 'Something went wrong...');
        res.redirect('/campgrounds');
    }
});


//List all the followers
router.get('/users/:id/followers', async function (req, res) {
    try {
        const foundUser = await User.findById(req.params.id).populate('followers');
        res.render('users/followers', { user: foundUser });
    } catch (err) {
        req.flash('error', 'Something went wrong...');
        res.redirect('/campgrounds');
    }
});

// METHOD  : PATCH
// ROUTE   : /users/:id
// FUNCTION: Modify profile
router.put('/users/:id', async (req, res) => {
    try {
        let newData = {};
        const updateUser = await User.findById(req.params.id);

        if (!req.file) {
            newData = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                avatar: req.body.avatar
            };
        } else {
            // const dataUri = req =>
            //     dUri.format(
            //         path.extname(req.file.originalname).toString(),
            //         req.file.buffer
            //     );
            // const file = dataUri(req).content;
            // const uploadImage = await cloudinary.uploader.upload(file);
            // await cloudinary.v2.uploader.destroy(updateUser.avatar.id);

            newData = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                avatar: req.body.avatar
            };
        }

        await updateUser.update({ $set: newData }).exec();

        req.flash('success', 'Successfully Updated!');
        res.redirect('/users/' + updateUser._id);
    } catch (err) {
        console.log(err.message);
        req.flash('error', 'Something went wrong...');
        res.redirect('/users/' + req.params.id);
    }
});

// METHOD  : GET
// ROUTE   : /users/:id/edit
// FUNCTION: Show the edit profile page
router.get('/users/:id/edit', middleware.isLoggedIn, async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id).exec();
        if (foundUser._id.equals(req.user._id)) {
            res.render('users/edit', { user: foundUser });
        } else {
            req.flash('error', "You don't have permission to do that");
            res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function (req, res) {
    try {
        let user = await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: { $each: [req.user._id] } } }, { new: true });
        // user.followers.push(req.user._id); //follow the user requested and add it
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
