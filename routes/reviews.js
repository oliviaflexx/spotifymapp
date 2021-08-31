const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Song = require('../models/song');
const Review = require('../models/review');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const song = await Song.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    song.reviews.push(review);
    await review.save();
    await song.save();
    res.redirect(`/songs/${song._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Song.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/songs/${id}`);
}))

module.exports = router;