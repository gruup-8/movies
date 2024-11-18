import React from 'react';

function MovieList({ movies }) {
  return (
    <table>
      <tbody>
        {movies.map((movie) => (
          <tr key={movie.id}>
            <td>{movie.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MovieList;