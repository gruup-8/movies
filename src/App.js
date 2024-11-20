import React, { useEffect, useState } from 'react';
import './App.css';
import MovieList from './components/MovieList';
import GenreDropdown from './components/GenreDropdown';
import Pagination from './components/Pagination';
import {
  fetchGenres,
  fetchMoviesByName,
  fetchMoviesByGenre,
  fetchTopRatedMovies,
} from './services/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false); // Tracks when "Search by Name" button is pressed
  const [filter, setFilter] = useState('name'); // Default filter is "name"
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };
    loadGenres();
  }, []);

  // Fetch movies based on the selected filter
  useEffect(() => {
    const loadMovies = async () => {
      let data;

      if (filter === 'name' && searchTrigger) {
        // Fetch movies only when "Search by Name" button is clicked
        data = await fetchMoviesByName(searchQuery, page);        
      } else if (filter === 'genre' && selectedGenre) {
        data = await fetchMoviesByGenre(selectedGenre, page);
      } else if (filter === 'topRated') {
        data = await fetchTopRatedMovies(page);
      }

      if (data) {
        setMovies(data.results || []);
        setPageCount(data.total_pages || 0);
      }
    };

    loadMovies();
    // Reset searchTrigger to prevent repeat calls unless button is pressed again
    if(searchTrigger) setSearchTrigger(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchTrigger, selectedGenre, page]);

  return (
    <div id="container">
      <h3>Search Movies</h3>

      {/* Search by Name */}
      <div>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => {
            setFilter('name');
            setPage(1); // Reset page
            setSearchTrigger(true); // Trigger search
          }}
          disabled={!searchQuery.trim()}
        >
          Search by Name
        </button>
      </div>

      {/* Search by Genre */}
      <div>
        <GenreDropdown
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreChange={(genre) => {
            setSelectedGenre(genre);
            setFilter('genre');
            setPage(1); // Reset page
          }}
        />
      </div>

      {/* Fetch Top Rated Movies */}
      <button
        onClick={() => {
          setFilter('topRated');
          setPage(1); // Reset page
        }}
      >
        Show Top Rated
      </button>

      {/* Display Movies */}
      <MovieList movies={movies} />
      <div id='pagination'>
        {/* Pagination */}
        <Pagination pageCount={pageCount} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default App;