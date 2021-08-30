const express = require("express");
const app = express()
var SpotifyWebApi = require('spotify-web-api-node');
app.use(express.urlencoded({ extended: true}))

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: 'afa5980856c14f2fad905e9dfa30c1ea',
    clientSecret: '5aab0fc9cbc84c8bbcd82c0b0b0b44c5',
    redirectUri: 'http://localhost:8080/loggedin'
  });

app.set('view engine', 'ejs');

// for every call set access token
app.use((reg, res, next) => {
    // Retrieve an access token.
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
    next();
})

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];

app.get('/', (req, res) => {
    // const num = 1 + 3;
    // const me = await spotifyApi.getMe()
    // .then(function(data) {
    //     // console.log('Some information about the authenticated user', data.body);
    //     return data;

    // }, function(err) {
    //     console.log('Something went wrong!', err);
    // });

    // // Get tracks in the signed in user's Your Music library
    // const mySavedTracks = await spotifyApi.getMySavedTracks({
    //     limit : 5,
    //     offset: 1
    // })
    // .then(function(data) {
    //     console.log('Done!', data.body.items);
    // }, function(err) {
    //     console.log('Something went wrong!', err);
    // });

    res.render('home')
})

app.post('/findSong', async (req, res) => {
    const { song, artist} = req.body

    const tracks = await spotifyApi.searchTracks(`track:${song} artist:${artist}`, {limit: 5, offset: 0})
        .then(function(data) {
        console.log(data.body.tracks.items)
        console.log('track:'+ data.body.tracks.items);
        return data.body.tracks.items
        }, function(err) {
        console.log('Something went wrong!', err);
    });

    res.render('foundsongs', {tracks:tracks})

})



app.get('/rand', (req, res) => {
    res.render('rand')
})

app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });

  
app.get('/loggedin', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];
    const expires_in = data.body['expires_in'];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log('access_token:', access_token);
    console.log('refresh_token:', refresh_token);

    console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
    );
    res.redirect('/');

    setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
    }, expires_in / 2 * 1000);
    })
    .catch(error => {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
    });
});

app.listen(8080, () => {
    console.log("LISTENING ON PORT 8080")
})

