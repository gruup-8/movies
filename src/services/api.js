import React, { useEffect, useState } from 'react';
import MovieList from '../components/MovieList';
import GenreDropdown from '../components/GenreDropdown';
import Pagination from '../components/Pagination';

const MoviePage = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState([]);
  const [selectGenre, setSelectGenre] = useState('');
  const [topRated, setTopRated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/genres');
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenre(data);
    } catch (err) {
      console.error('Error fetching genres: ', err);
      setError('Failed to fetch genres');
    }
  };

  const fetchMoviesFromDB = async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movies?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Error fetching movies: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data.results)) {
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } else {
        setError('Unexpected response format: results is not an array');
      }
    } catch (err) {
      console.error('Error fetching movies from database: ', err);
      setError('Failed to fetch, Try again');
    }
  };

  useEffect(() => {
    fetchMoviesFromDB(currentPage, 10); // Fetch movies on first load and whenever page changes
  }, [currentPage]);

  const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movies/genre/${genreId}?page=${page}`);
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies by genre');
    }
  };

  const handleGenres = (genreId, page = 1) => {
    setSelectGenre(genreId);
    setQuery(''); 
    setCurrentPage(page);
    if (genreId) {
      fetchMoviesByGenre(genreId, 1);
    }
  };

    const handleSearch = async (page = 1) => {
      if (!query.trim()) return;
      setSelectGenre('');
      setCurrentPage(page);

      try {
        const response = await fetch(`http://localhost:3001/api/movies/search?query=${query.trim()}&page=${page}`);
        if (!response.ok) {
          throw new Error('Failed search');
        }
        const data = await response.json();
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error('Error with fetch: ', err);
        setError('Failed to fetch movies');
      } 
    };

    const handlePageChange = (newPage) => {
      if (newPage <= 0 || newPage > totalPages) return;

      setCurrentPage(newPage);

      if (selectGenre) {
        fetchMoviesByGenre(selectGenre, newPage);
      } else if (query.trim()) {
        handleSearch(newPage);
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
          <button onClick={() => handleSearch(1)}>Search</button>
          <div className="filter-bar">
          <GenreDropdown
            genres={genre}
            selectedGenre={selectGenre}
            onGenreChange={handleGenres}
          />
          <button onClick={() => handleTopRated()}>Top Rated</button>
        </div>
        <MovieList movies={movies} />
        <Pagination 
          pageCount={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  export default MoviePage;