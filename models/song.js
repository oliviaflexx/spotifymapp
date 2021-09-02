const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const Like = require('./like')


const opts = { toJSON: { virtuals: true } };

const SongSchema = new Schema({
    title: String,
    artist: String,
    image: String,
    spotify_id: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts);

SongSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/songs/${this._id}"><img class="popup_image" src="${this.image}"></img></a>`
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