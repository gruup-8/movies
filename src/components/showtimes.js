import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AddToGroupPage from './addToGroupPage';
import AreasMenu from './areas';
import '../styles/Showtimes.css';

const Showtimes = ({groupId}) => {
    const [selectedArea, setSelectedArea] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);  

        const fetchShowtimes = async (areaId) => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get('http://localhost:3001/areas/shows', {
                    params: {
                        area_id: areaId,
                    },
                });
                setShowtimes(response.data);
            } catch (err) {
                setError('Failed fetching showtimes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (selectedArea) {
                fetchShowtimes(selectedArea);
            }
        }, [selectedArea]);
        
    return (
        <div>
            <h1>Showtimes</h1>
            <AreasMenu onAreaSelect={(areaId) => setSelectedArea(areaId)} />
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {!loading && !error && (
                <ul className="showtime-list">
                    {showtimes.map((showtime) => (
                        <li key={showtime.id} className="showtime-card">
                            <h2 className="showtime-title">{showtime.title}</h2>
                            <p>{showtime.theatre}</p>
                            <p>{new Date(showtime.startTime).toLocaleString()}</p>
                            {showtime.pic_link && (
                                <img
                                src={showtime.pic_link}
                                alt={showtime.title}
                                className="showtime-poster"
                                />
                            )}
                            <AddToGroupPage 
                                groupId={groupId}
                                movieId={showtime.id}
                                showtime={showtime}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Showtimes;