import { every } from 'd3';
import React, {useState, useEffect} from 'react';
import { Form, Button, Row } from 'react-bootstrap';


function SpotifyTop(){
    const [topType, setTopType] = useState('artists');
    const [timeRange, setTimeRange] = useState('medium_term');
    const [topList, setTopList] = useState(null);

    const handleTypeChange = (event) => {
        setTopType(event.target.value);
    }

    const handleTimeRange = (event) => {
        setTimeRange(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            const response = await fetch(`/auth/top_list?type=${topType}&time_range=${timeRange}`);
            if(!response.ok){
                throw new Error('network response not ok');
            }
            const contentType = response.headers.get('content-type');
            if(!contentType || !contentType.includes('application/json')){
                throw new Error('Expected JSON response from server');
            }

            const listData = await response.json();
            setTopList(listData);

        }catch(err){
            console.error('error fetching top list data', err);
        }
    };

    console.log(topType);
    console.log(timeRange);
    console.log(topList);

    return(
        <>
          <Form onSubmit={handleSubmit}>
            <Row>
            <Form.Group>
                <Form.Label>
                    Search By
                </Form.Label>
                <Form.Select value={topType} onChange={handleTypeChange}>
                    <option value="artists">
                        Artists
                    </option>
                    <option value="tracks">
                        Tracks
                    </option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Time Range
                </Form.Label>
                <Form.Select value={timeRange} onChange={handleTimeRange}>
                    <option value={"short_term"}>
                        3 months
                    </option>
                    <option value={"medium_term"}>
                        6 months
                    </option>
                    <option value={"long_term"}>
                        1 year
                    </option>
                </Form.Select>
            </Form.Group>
            <Button type='submit' >Submit</Button>
            </Row>

          </Form>
        </>
    );
}



export default SpotifyTop;