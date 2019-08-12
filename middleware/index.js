var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");
//all the middlewares goes here

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err) {
                req.flash("error", "Campground not found")
                res.redirect("back")
            } else {
                //does user own the campground
                if (foundCampground.author.id.equals(req.user._id)||req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You must be logged in to do that")
        //if the user is not logged in we will do this
        res.redirect("back");
        //it wil redirect the user to the previous page
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back")
            } else {
                //does user own the comment
                if (foundComment.author.id.equals(req.user._id)||req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You must be logged in to do that");
        //if the user is not logged in we will do this
        res.redirect("back");
        //it wil redirect the user to the previous page
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;