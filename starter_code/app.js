require('dotenv').config();

const express = require('express');
const path = require('path');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));
app.use(express.static(path.join(__dirname, '/public')));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => {
    spotifyApi.setAccessToken(data.body['access_token']);
  })
  .catch((error) => {
    console.log('Something went wrong when retrieving an access token', error);
  });

// the routes go here:
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/artists', async (req, res) => {
  const { artist } = req.query;
  const artistData = await spotifyApi.searchArtists(artist);
  const { items } = artistData.body.artists;
  try {
    res.render('cards', { items });
  } catch (error) {
    throw new Error(error);
  }
});

app.get('/albuns/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const albunsData = await spotifyApi.getArtistAlbums(artistId);
  const { items } = albunsData.body;
  console.log(items);
  try {
    res.render('cards', { items });
  } catch (error) {
    throw new Error(error);
  }
});

app.get('/tracks/:albumId', async (req, res) => {
  const { albumId } = req.params;
  const tracksData = await spotifyApi.getAlbumTracks(albumId);
  const { items } = tracksData.body;
  const artistId = items[0].artists[0].id;
  try {
    res.render('tracks', { items, artistId });
  } catch (error) {
    throw new Error(error);
  }
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
