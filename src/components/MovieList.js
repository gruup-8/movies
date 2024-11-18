import React from 'react';

function MovieList({ movies }) {
  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card">
          <div className="movie-poster">
            {movie.image ? (
              <img src={movie.image} alt={`${movie.title} Poster`} />
            ) : (
              <span>No Image Available</span>
            )}
          </div>
          <div className="movie-title">{movie.title}</div>
        </div>
      ))}
    </div>
  );
}

export default MovieList;