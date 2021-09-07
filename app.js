if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
var SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Song = require('./models/song');

const userRoutes = require('./routes/users');
const songs = require('./routes/songs');
const reviews = require('./routes/reviews');

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/spotifymapp';
const secret = process.env.SECRET || 'idk';
mongoose.connect(dbUrl,
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

const sessionConfig = {
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        secret: secret
    })
    }

app.use(session(sessionConfig))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: 'afa5980856c14f2fad905e9dfa30c1ea',
    clientSecret: process.env.CLIENT_SECRET,
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

app.use('/', userRoutes);
app.use('/songs', songs)
app.use('/songs/:id/reviews', reviews)

app.get('/', async (req, res) => {
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

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("LISTENING ON PORT 8080")
})

