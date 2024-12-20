import React, { useState, useEffect } from "react";
import { fetchReviews, postReview } from "../services/reviewApi";
import { getToken } from "../services/authService";

const MovieReview = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({movie_id: "", stars: "", comment: "" });
  const token = getToken();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const movieReviews = await fetchReviews(movieId);
        setReviews(movieReviews);
      } catch (error) {
        console.error("Error loading movie data:", error);
      }
    };
    if (movieId) {
      loadReviews();
    };
  }, [movieId]);

  useEffect(() => {
    setNewReview((prevReview) => ({
      ...prevReview,
      movie_id: movieId,
    }));
  
  }, [movieId]);  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const postedReview = await postReview(movieId, newReview.stars, newReview.comment);
        setReviews((prevReviews) => [...prevReviews, postedReview.review]); // Update state
        setNewReview({ movie_id: "", stars: "", comment: "" });
    } catch (error) {
        console.error("Error posting review:", error);
    }
  };

  return (
    <div>
      <h3>Reviews</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.movie_id} className="review-card">
            {review.movie_id}
            <p>{review.stars} ★</p>
            <p>{review.comment}</p>
            <p>
              <i>
                By {review.user_email} on {new Date(review.timestamp).toLocaleString()}
              </i>
            </p>
          </div>
        ))
      ) : (
        <div>No reviews yet. Be the first to add one!</div>
      )}

      <h3>Add a Review</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Stars:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={newReview.stars}
            onChange={(e) =>
              setNewReview({ ...newReview, stars: e.target.value })
            }
          />
        </div>
        <div>
          <label>Comment:</label>
          <textarea
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          ></textarea>
        </div>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default MovieReview;
