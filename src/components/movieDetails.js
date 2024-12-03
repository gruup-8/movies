import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addFavorites } from '../services/favorites';
import AddToGroupPage from './addToGroupPage';
import MovieReview from './MovieReview';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const handleAdd = async () => {
        console.log('Movie ID being added to favorites:', id);
        const requestBody = {
            id: id,
        };
        console.log('Sending request to add favorite:', requestBody);
        try {
            await addFavorites(id);
            setMessage('Movie added to favorites!');
        } catch (err) {
            setMessage(err.message);
        }
    };

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/movies/movie/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch details');
                }
                const data = await response.json();
                setMovie(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchMovieDetails();
    }, [id]);
    


    if (error) {
        return <div>{error}</div>;
    }
    if (!movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className='movie-details'>
            <button onClick={handleAdd}>Add to Favorites</button>
            {message && <p>{message}</p>}
            <h1>{movie.title}</h1>
            <img src={movie.poster_path} alt={movie.title}></img>
            <p>{movie.overview}</p>
            <p><strong>Release Date: {movie.release_date}</strong></p>
            <p><strong>Genres:</strong> {movie.genres}</p>
            <p><strong>Production Companies:</strong> {movie.production_companies}</p>
            <p><strong>IMDB ID:</strong> <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer">Link</a></p>
            <a href={movie.homepage} target="_blank" rel="noopener noreferrer">Official Website</a>
            <AddToGroupPage movieId={id}/>
            <MovieReview movieId={id} />

        </div>
    );
};

export default MovieDetails;