import React from 'react';

function GenreDropdown({ genres, selectedGenre, onGenreChange }) {
  return (
    <select
      value={selectedGenre}
      onChange={(e) => onGenreChange(e.target.value)}
    >
      <option value="">Select Genre</option>
      {genres.map((genre) => (
        <option key={genre.genre_id} value={genre.genre_id}>
          {genre.genre_name}
        </option>
      ))}
    </select>
  );
}

export default GenreDropdown;
