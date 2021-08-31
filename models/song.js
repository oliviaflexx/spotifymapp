const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const Like = require('./like')

const SongSchema = new Schema({
    title: String,
    artist: String,
    image: String,
    spotify_id: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Like'
        }
    ]
});

SongSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        }),
        await Like.deleteMany({
            _id: {
                $in: doc.likes
            }
        })
    }
})

module.exports = mongoose.model('Song', SongSchema);