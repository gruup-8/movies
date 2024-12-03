import React, { useState, useEffect } from 'react';
import { fetchGroupMovies } from '../services/groupCustomization';

const GroupMovies = ({ groupId }) => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadMovies = async () => {
            setIsLoading(true);
            try {
                const fetchedMovies = await fetchGroupMovies(groupId);

                // Filter out rows where movie_id is null
                const validMovies = fetchedMovies.filter((movie) => movie.movie_id !== null);
                setMovies(validMovies);

            } catch (error) {
                console.error('Error fetching movies:', error);
                setErrorMessage('Failed to load movies.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMovies();
    }, [groupId]);

    if (isLoading) return <p>Loading movies...</p>;
    if (errorMessage) return <p>{errorMessage}</p>;
    if (movies.length === 0) return <p>No movies found for this group.</p>;

    return (
        <ul>
            {movies.map((movie) => (
                <li key={movie.movie_id}>
                    <h3>{movie.title}</h3>
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: '150px', height: '300px', objectFit: 'cover' }}
                    />
                    {movie.showtime && (
                        <p>Showtime: {movie.showtime}</p>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default GroupMovies;
