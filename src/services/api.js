const BASE_URL = 'https://api.themoviedb.org/3';

/* 
////////////////////\\\\\\\\\\\\\\\\\\\\
React (front-end) doesnt like .env files, when trying to get api requests.
For now im putting bearer token here, it seems to fix the problem for now
Well we see if this will work after we connect the back-end and front-end together
\\\\\\\\\\\\\\\\\\\\////////////////////
(╯°□°)╯︵ ┻━┻
*/
const API_TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYWU2YTRmMzkxZjhhY2E3YjZiNDFkZWYzYjI1MGY0MSIsIm5iZiI6MTczMTc3MTU4My41MDc0MDcsInN1YiI6IjY3MzM0Zjk1MDJjNDkzOTJmMWU4MTg2YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tdEQJZl6b6-HrcbSQQvplfz5s1Ff1cEavAEeb3aQZ3c`;

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

// Fetch genres from TMDb API
export const fetchGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?language=en-US`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.genres; // Returns array of genre objects
    } catch (error) {
      console.error('Failed to fetch genres:', error);
      return [];
    }
  };

// Fetch movies by name
export const fetchMoviesByName = async (query, page) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?query=${query}&language=en-US&page=${page}`,
    { headers }
  );
  const data = await response.json();
  return data;
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId, page) => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?with_genres=${genreId}&language=en-US&page=${page}`,
    { headers }
  );
  const data = await response.json();
  return data;
};

// Fetch top-rated movies
export const fetchTopRatedMovies = async (page) => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?language=en-US&page=${page}`, {
    headers,
  });
  const data = await response.json();
  return data;
};

