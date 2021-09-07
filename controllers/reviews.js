const Song = require('../models/song');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const song = await Song.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    song.reviews.push(review);
    await review.save();
    await song.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/songs/${song._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Song.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/songs/${id}`);
}
