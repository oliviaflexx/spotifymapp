const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { songSchema } = require('../schemas.js');
const appJs = require('../app.js')
const ExpressError = require('../utils/ExpressError');
const Song = require('../models/song');
const Like = require('../models/like');
const like = require('../models/like');

const validateSong = (req, res, next) => {
    const { error } = songSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// get all songs
router.get('/', catchAsync(async (req, res) => {
    const songs = await Song.find({});
    res.render('songs/index', { songs })
 
}));

router.get('/new', (req, res) => {
    res.render('songs/new')
});

// Add new song
router.post('/', validateSong, catchAsync(async (req, res, next) => {
    const { title, artist} = req.body.song;
    const track = await appJs.theSpotifyApi.searchTracks(`track:${title} artist:${artist}`, {limit: 1, offset: 0})
        .then(function(data) {
        return data.body.tracks.items[0]
        }, function(err) {
        console.log('Something went wrong!', err);
    });
    if (track) {
        const song = new Song({
            title: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0].url,
            spotify_id: track.id,
            description: req.body.song.description,
            location: req.body.song.location
        });
        await song.save();
    } else {
        throw new ExpressError('Song not found in Spotify Api', 400)
    }
    // req.flash('success', 'Successfully added a new song!');
    res.redirect('/songs')

}))

router.get('/:id', catchAsync(async (req, res,) => {
    const song = await Song.findById(req.params.id).populate('reviews');
    if (!song) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/songs');
    }
    res.render('songs/show', { song });
}));

//liked
router.post('/:id', catchAsync(async (req, res,) => {
    const song = await Song.findById(req.params.id);
    if (req.body.liked === 'true') {
        const like = await new Like({liked: true});
        song.likes.push(like);
        await song.save();
        await like.save();
    }
    return res.redirect(`/songs/${req.params.id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Song.findByIdAndDelete(id);
    res.redirect('/songs');
}));

module.exports = router;