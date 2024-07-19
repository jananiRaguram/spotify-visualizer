import React, { useState, useEffect } from 'react';
import Login from './Login'
import Profile from './Profile';
import SpotifyTop from './SpotifyTop';
import './App.css';
import { Container} from 'react-bootstrap';



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
      <Container>
        {!token ? <Login></Login> :             <SpotifyTop></SpotifyTop>
        }
      </Container>
    </>
  );
}


export default App;
