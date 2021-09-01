const Song = require('../models/song');
const Like = require('../models/like');
const appJs = require('../app.js')
const ExpressError = require('../utils/ExpressError');

module.exports.renderAllSongs = async (req, res) => {
    const songs = await Song.find({});
    res.render('songs/index', { songs })
}

module.exports.renderNewSong = (req, res) => {
    res.render('songs/new')
}

module.exports.addNewSong = async (req, res) => {
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
        song.author = req.user._id;
        await song.save();

    } else {
        throw new ExpressError('Song not found in Spotify Api', 400)
    }
    req.flash('success', 'Successfully added a new song!');
    res.redirect('/songs')
}

module.exports.showSong = async (req, res,) => {
    const song = await Song.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(song)
    if (!song) {
        req.flash('error', 'Cannot find that song!');
        return res.redirect('/songs');
    }
    res.render('songs/show', { song });
}

module.exports.likeSong = async (req, res,) => {

    if (req.body.liked === 'true') {
        const song = await Song.findById(req.params.id);
        const like = await new Like({liked: true});
        like.author = req.user._id;
        song.likes.push(like);
        await song.save();
        await like.save();
    }   
    return res.redirect(`/songs/${req.params.id}`);
}

module.exports.deleteSong = async (req, res) => {
    const { id } = req.params;
    await Song.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted song')
    res.redirect('/songs')
}