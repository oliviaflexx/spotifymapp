const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: String,
    artist: String,
    image: String,
    spotify_id: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Song', SongSchema);