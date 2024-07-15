const express = require('express')
const request = require('request');
const axios = require('axios');
const dotenv = require('dotenv');

const port = 5000

let global_access_token = null;

function updateAccessToken(token){
  global_access_token = token.access_token;
}

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
var spotify_redirect_uri = 'http://localhost:3000/auth/callback'

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var app = express();

app.get('/auth/login', (req, res) => {

  var scope = "streaming user-read-email user-read-private"
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', async (req, res) => {

  const code = req.query.code;

  const authOptions = {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    }),
  };

  try{
    const response = await axios(authOptions);
    updateAccessToken(response.data);
    res.redirect('/');
  }catch(err){
    console.error('error fetching token', err);
    res.status(500).send('auth error');
  }
});

app.get('/auth/token', (req, res) => {
  // console.log(global_access_token);
  res.json({ access_token: global_access_token})
})

app.get('/auth/profile', async (req, res) => {

  try {
    console.log(global_access_token);

    const response = await axios.get('https://api.spotify.com/v1/me',{
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${global_access_token}`
      }
    });
    const profile = response.data;
    console.log(profile);
    
    res.json(profile);
  } catch (err) {
    console.error('error fetching profile', err);
    res.status(500).send('error fetching profile');
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
