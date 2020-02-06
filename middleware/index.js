var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var Review = require("../models/review");
//all the middlewares goes here

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findOne({slug: req.params.slug}, function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found")
                res.redirect("back")
            } else {
                //does user own the campground
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that")
        //if the user is not logged in we will do this
        res.redirect("back");
        //it wil redirect the user to the previous page
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment Not Found");
                res.redirect("back")
            } else {
                //does user own the comment
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
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

middlewareObj.checkReviewOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, function (err, foundReview) {
            if (err || !foundReview) {
                res.redirect("back");
            } else {
                // does user own the comment?
                if (foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findOne({slug: req.params.slug}).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground.slug);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


module.exports = middlewareObj;