import React, {useState, useEffect} from 'react';

function Profile(){
    const [profile, setProfile] = useState(null);

    useEffect(() =>{
        async function fetchProfile(){
            try {
                const response = await fetch('/auth/profile');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }else{
                    console.log('ok');
                }
                
                const contentType = response.headers.get('content-type');
                // const responseBody = await response.text(); // Get response body as text
    
                // console.log('Response Body:', responseBody);
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Expected JSON response from server');
                }
                const profileData = await response.json();
                console.log(profileData);
                setProfile(profileData);
            }catch(err){
                console.error('error fetching profile front end', err);
            }
        }
        fetchProfile()
    }, []);

    if(!profile){
        return <div>Loading...</div>;
    };

    return (
        <div>
            <p>{profile.display_name}</p>
        </div>
    )
}

export default Profile