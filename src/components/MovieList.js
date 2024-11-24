import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MovieList({ movies }) {

  if (!movies || movies.length === 0) {
    return <div>No movies available.</div>;
  }

  return (
    <div className="movie-list">
      {/* Render the list of movies */}
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="movie-card"
        >
          <Link to={`/movie/${movie.id}`}>
           <img
           className="movie-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}` || 'default-image.jpg'}  // Fallback if no image
            alt={movie.title}
          />
          </Link>
           <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-release-year">{movie.release_year}</div>
        </div>
      ))}
    </div>
  );
}
export default MovieList;