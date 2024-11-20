const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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

// Movie poster
const transformMovieData = (movies) =>
  movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    overview: movie.overview,
    release_date: movie.release_date,
  }));


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
    `${BASE_URL}/search/movie?query=${query}&include_adult=false&language=en-US&without_keywords=190370,301766,155477,211121,445&page=${page}`,
    { headers }
  );

  if(!response.ok){
    throw new Error(`Error fetching movies: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('Fetched Movies:', data.results);

  return {
    results: transformMovieData(data.results),
    total_pages: data.total_pages,
  };
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId, page) => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?with_genres=${genreId}&language=en-US&page=${page}`,
    { headers }
  );

  if(!response.ok) {
    throw new Error(`Error fetching movies: ${response.statusText}`);
  }
  const data = await response.json();

  // Map through the results and format them to include the image
  return {
    results: transformMovieData(data.results),
    total_pages: data.total_pages,
  };
};

// Fetch top-rated movies
export const fetchTopRatedMovies = async (page) => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?language=en-US&page=${page}`, {
    headers,
  });
  const data = await response.json();
  return {
    results: transformMovieData(data.results),
    total_pages: data.total_pages,
  };
};
