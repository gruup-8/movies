import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGroupMovies } from '../services/groupCustomization';

const GroupMovies = ({ groupId }) => {
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGroupData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchGroupMovies(groupId);
                console.log('Fetched group data:', response);
                
                if (!response || !response.movies || !response.showtimes) {
                    console.error('Invalid response structure', response);
                    return;
                }

                const validMovies = response.movies.filter((item) => item.title && item.poster_path);
                setMovies(validMovies);

                const validShowtimes = response.showtimes.filter(
                    (item) => item.movie_title && item.show_time && item.theatre_name
                );
                setShowtimes(validShowtimes);

                if (validShowtimes.length === 0) {
                    console.log('No valid showtimes found.');
                } else {
                    console.log('Valid showtimes:', validShowtimes);
                }
            } catch (err) {
                setError('Failed to load group data.');
                console.error('Error fetching group data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupData();
    }, [groupId]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {/* Movies Section */}
            <h2>Movies</h2>
            {movies.length > 0 ? (
                movies.map((movie) => (
                    <div key={movie.movie_id}>
                        <Link to={`/movie/${movie.movie_id}`}>
                        <h3>{movie.title || "Untitled Movie"}</h3>
                        {movie.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title || "Poster"}
                                style={{ width: '100px', height: '150px' }}
                            />
                        )}
                        </Link>
                    </div>
                ))
            ) : (
                <p>No movies available for this group.</p>
            )}

            {/* Showtimes Section */}
            <h2>Showtimes</h2>
            {showtimes.length > 0 ? (
                showtimes.map((showtime, index) => (
                    <div key={index}>
                        <h3>{showtime.movie_title || "Untitled Show"}</h3>
                        <p>{showtime.theatre_name || "Unknown Theatre"}</p>
                        <p>{new Date(showtime.show_time).toLocaleString()}</p>
                        {showtime.picture && (
                            <img src={showtime.picture} alt={showtime.movie_title || "Show Poster"} />
                        )}
                    </div>
                ))
            ) : (
                <p>No showtimes available for this group.</p>
            )}
        </div>
    );
};

export default GroupMovies;
