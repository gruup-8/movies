import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AreasMenu from './areas';
import AddToGroupPage from './addToGroupPage';

const Showtimes = ({ groupId }) => {
    const [selectedArea, setSelectedArea] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            {!loading && !error && showtimes.length > 0 ? (
                <ul>
                    {showtimes.map((showtime) => (
                        <li key={showtime.id} style={{ marginBottom: '20px', listStyleType: 'none' }}>
                            <h2>{showtime.title}</h2>
                            <p>Theatre: {showtime.theatre}</p>
                            <p>Showtime: {new Date(showtime.startTime).toLocaleString()}</p>
                            {showtime.pic_link && (
                                <img
                                    src={showtime.pic_link}
                                    alt={showtime.title}
                                    style={{ width: '100px', height: '150px', objectFit: 'cover' }}
                                />
                            )}
                            {/* Add movie/showtime to group */}
                            <AddToGroupPage 
                                groupId={groupId} 
                                movieId={showtime.id}
                                showtime={showtime.startTime}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No showtimes found for the selected area.</p>
            )}
        </div>
    );
};

export default Showtimes;
