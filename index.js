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

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    console.log('ACCESS TOKEN' + spotifyApi.getAccessToken())
    res.render('home')
})

app.post('/findSong', async (req, res) => {
    const { song, artist} = req.body

    const track = await spotifyApi.searchTracks(`track:${song} artist:${artist}`, {limit: 1, offset: 0})
        .then(function(data) {
        console.log(data.body.tracks.items[0].artists[0].name)
        return data.body.tracks.items[0]
        }, function(err) {
        console.log('Something went wrong!', err);
    });
    console.log(track.album.images)
    res.render('foundsongs', {track:track})

})



app.get('/rand', (req, res) => {
    res.render('rand')
})


app.listen(8080, () => {
    console.log("LISTENING ON PORT 8080")
})

