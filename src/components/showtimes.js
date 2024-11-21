import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Showtimes = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                const response = await axios.get('http://localhost:3001/showtimes/fetch');
                setShowtimes(response.data);
            } catch (err) {
                setError('Failed fetching showtimes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Showtimes</h1>
            <ul>
                {showtimes.map((showtime) => (
                    <li key={showtime.id}>
                        <h2>{showtime.title}</h2>
                        <p>{showtime.theatre}</p>
                        <p>{new Date(showtime.startTime).toLocaleString()}</p>
                        {showtime.pic_link && <img src={showtime.pic_link} alt={showtime.title}/>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Showtimes;