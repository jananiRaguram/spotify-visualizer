
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

  var scope = "streaming user-read-email user-read-private user-top-read"
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
    // console.log(global_access_token);

    const response = await axios.get('https://api.spotify.com/v1/me',{
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${global_access_token}`
      }
    });
    const profile = response.data;
    // console.log(profile);
    
    res.json(profile);
  } catch (err) {
    console.error('error fetching profile', err);
    res.status(500).send('error fetching profile');
  }
});

app.get('/auth/top_list', async (req, res) => {
  const searchType = req.query.type;
  const timeRange = req.query.time_range;
  const limit = 50;
  // console.log(search_type);
  // console.log(time_range);

  //offset limit to be changed if they want more
  //const offset = 

  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/top/${searchType}?time_range=${timeRange}&limit=${limit}`,{
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${global_access_token}`
      }
    });
    const topData = response.data;
    const networkData = formatToNetworkData(topData, searchType);
    //format data for d3
    res.json(networkData);
  }catch(err){
    console.error('error fetching top list', err);
    res.status(500).send('error fetching top list');
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})


// export const data = {
//   nodes: [
//       { id: "Myriel", group: 'team1' },
//       { id: "Anne", group: 'team1' },
//       ...
//   ],
//   links: [
//       { source: "Anne", target: "Myriel", value: 1 },
//       { source: "Napoleon", target: "Myriel", value: 1 },
//       ...
//   ]
// }

function formatToNetworkData(spotifyData, searchType){

  //name for artist catagory -> artist name
  //name for track category -> track name
  //popularity type is same for both
  const nodes = spotifyData.items.map(item =>(
    {
      name: item.name,
      group: item.popularity
    }
  ));

  const linkData = new Map(); 
  if(searchType == "artists" ){

    // nodes linked by genre between artists, creating set to easily create 
    // source and target links for a genre
    // { genre: "pop", artist: [billie eilish, new jeans] }

    spotifyData.items.forEach(item => {
      item.genres.forEach(genre => {

        if(!linkData.has(genre)){
          linkData.set(genre, []);
        }
        
        linkData.get(genre).push(item.name);
      });
    });

  }else{

     //nodes -> tracks, artists 
      // size of tracks is popularity
    //links -> track to artist
      // width of link is number of top tracks they are on

    spotifyData.items.forEach(item => {

    })
    
   
      
  }

  const links = createLinks(linkData);

  return {nodes, links};
}


function createLinks(dataMap){
  const links = [];

  dataMap.forEach((value, key) => {
    for(let i = 0; i< value.length; i++){
      for(let j = i + 1; j < value.length; j++){
        links.push({
          source: value[i],
          target: value[j],
          type: key
        });
      }
    }
  });

  return links;
}