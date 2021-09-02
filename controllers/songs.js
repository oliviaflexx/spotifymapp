const Song = require('../models/song');
const Like = require('../models/like');
const appJs = require('../app.js')
const ExpressError = require('../utils/ExpressError');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config();
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.renderAllSongs = async (req, res) => {
    const songs = await Song.find({})
    res.render('songs/index', { songs })
}
module.exports.renderMap = async (req, res) => {
    const songs = await Song.find({})
    res.render('songs/map', { songs })
}
module.exports.renderNewSong = (req, res) => {
    res.render('songs/new')
}

module.exports.addNewSong = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.song.location,
        limit: 1
    }).send()
    if (geoData === undefined) {
        req.flash('error', 'Invalid location');
        return res.redirect('/songs/new');
    }
    console.log(geoData.body.features)
    // console.log(geoData.body.features[0].context)
    var locationInputValid = 'no';
    try {
        for(let context of geoData.body.features[0].context) {
            if (context.wikidata === 'Q340') {
                locationInputValid = 'yes'
            }
        }
    } catch (error) {
        req.flash('error', 'Invalid location');
        return res.redirect('/songs/new');
    }
    
    if (locationInputValid === 'no') {
        req.flash('error', 'Location is not in Montreal');
        return res.redirect('/songs/new');
    }

    // if (geoData.body.features[0].context[2].wikidata !== 'Q340') {
    //     console.log(geoData.body.features[0].context[2].wikidata)
    //     req.flash('error', 'Location is not in Montreal');
    //     return res.redirect('/songs/new');
    // }
    
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
            location: geoData.body.features[0].place_name,
            geometry: geoData.body.features[0].geometry
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
    try {
        const song = await Song.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('songs/show', { song });
    } catch (error) {
        console.log(error)
        req.flash('error', 'Sorry, we can\'t find that song!');
        return res.redirect('/songs');
    }
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