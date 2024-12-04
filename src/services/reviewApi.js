import { getToken } from "./authService";

const BASE_URL = 'http://localhost:3001';

// Fetch reviews for a movie
export const fetchReviews = async() => {
    try{
        const response = await fetch(`${BASE_URL}/review`,{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch reviews');
        }
        const data = await response.json();
        if (data.length === 0) {
          console.log('Theres no review'); // Log this case for debugging
        }
        return data;
    }catch(err){
        console.error('Failed fetching reviews:', err);
        throw err;
    }
}

// Post a new review
export const postReview = async (movie_id, stars, comment) => {
  const token = getToken();

    if (!token) {
        throw new Error('User is not authenticated');
    }

  console.log('Sending review:', { movie_id, stars, comment, token });
        const response = await fetch(`${BASE_URL}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_id, stars, comment }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to post review");
      }
      return await response.json();
  };