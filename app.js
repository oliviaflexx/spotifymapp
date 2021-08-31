const express = require("express");
var SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const songs = require('./routes/songs');

mongoose.connect('mongodb://localhost:27017/spotifymapp',
    err => {
        if(err) throw err;
        console.log('connected to MongoDB')
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: 'afa5980856c14f2fad905e9dfa30c1ea',
    clientSecret: '5aab0fc9cbc84c8bbcd82c0b0b0b44c5',
    redirectUri: 'http://localhost:8080/loggedin'
  });

spotifyApi.clientCredentialsGrant().then(
    function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
    console.log('Something went wrong when retrieving an access token', err);
    }
);

module.exports.theSpotifyApi = spotifyApi;

app.use('/songs', songs)
// app.use('/songs/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(8080, () => {
    console.log("LISTENING ON PORT 8080")
})

