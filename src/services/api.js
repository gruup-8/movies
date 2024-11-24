import React, { useEffect, useState } from 'react';
import MovieList from '../components/MovieList';
import GenreDropdown from '../components/GenreDropdown';

const MoviePage = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState([]);
  const [selectGenre, setSelectGenre] = useState('');
  const [topRated, setTopRated] = useState(false);

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/genres');
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      console.log("Fetched genres:", data); 
      setGenre(data);
    } catch (err) {
      console.error('Error fetching genres: ', err);
      setError('Failed to fetch genres');
    }
  };

  const fetchMoviesFromDB = async (endpoint) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movies`);
      if (!response.ok) {
        throw new Error(`Error fetching movies: ${response.statusText}`);
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies from database: ', err);
      setError('Failed to fetch, Try again');
    }
  };

  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movies/genre/${genreId}`);
      const data = await response.json();
      setMovies(data.results);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies by genre');
    }
  };

  const handleGenres = (genreId) => {
    setSelectGenre(genreId);
    if (genreId) {
      fetchMoviesByGenre(genreId);
    }
  };

    const handleSearch = async () => {
      if (!query.trim()) return;

      try {
        const response = await fetch(`http://localhost:3001/api/movies/search?query=${query.trim()}&page=1`);
        if (!response.ok) {
          throw new Error('Failed search');
        }
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.error('Error with fetch: ', err);
        setError('Failed to fetch movies');
      } 
    };

    const handleTopRated = async () => {
      setTopRated(true);
      try {
        const response = await fetch('http://localhost:3001/api/movies/top-rated');
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError('Failed to fetch top-rated movies');
      }
    };

    useEffect(() => {
      fetchGenres();
      fetchMoviesFromDB();
    }, []);

    if (error) {
      return <div className='error-message'>{error}</div>;
    }

    return (
      <div className="movie-page">
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <div className="filter-bar">
          <GenreDropdown
          genres={genre}
          selectedGenre={selectGenre}
          onGenreChange={handleGenres}
          />
          <button onClick={handleTopRated}>Top Rated</button>
        </div>
        <MovieList movies={movies} />
      </div>
    );
  };

  export default MoviePage;