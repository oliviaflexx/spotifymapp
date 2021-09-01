const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateSong } = require('../middleware');
const songs = require('../controllers/songs');

router.route('/')
    .get(catchAsync(songs.renderAllSongs))


router.route('/new')
    .get(isLoggedIn, songs.renderNewSong)
    .post(isLoggedIn, validateSong, catchAsync(songs.addNewSong))


router.route('/:id')
    .get(catchAsync(songs.showSong))
    .post(isLoggedIn, catchAsync(songs.likeSong))
    .delete(isLoggedIn, isAuthor, catchAsync(songs.deleteSong))

module.exports = router;