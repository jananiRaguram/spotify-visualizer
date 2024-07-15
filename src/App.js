import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import Profile from './Profile';
import './App.css';


function App() {

  const [token, setToken] = useState('');

  useEffect(() => {

    async function fetchData() {
      
      try{
        const response = await fetch('/auth/token');
        const json = await response.json();
        setToken(json.access_token);

      
      }catch(err){
        console.error('Error fetching', err);
      }
    }

    fetchData();

  }, []);

  return (
    <>
      {!token ? <Login></Login> : <Profile></Profile>}

    </>
  );
}


export default App;
