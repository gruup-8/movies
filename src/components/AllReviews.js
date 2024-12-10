import React, { useState, useEffect } from "react";

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllReviews = async () => {
            try {
                console.log('Fetching reviews...');
                const response = await fetch(`http://localhost:3001/review`);
                console.log('Response received:', response);
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch reviews');
                }
    
                const data = await response.json();
                console.log('Fetched reviews:', data);
                setReviews(data);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError(err.message);
            }
        };
    
        fetchAllReviews();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (reviews.length === 0) {
        return <div>No reviews available.</div>;
    }

    // Group reviews by movie_id
    const groupedReviews = reviews.reduce((acc, review) => {
        if (!acc[review.movie_id]) {
            acc[review.movie_id] = {
                movie_title: review.movie_title,
                movie_poster: review.movie_poster,
                reviews: [],
            };
        }
        acc[review.movie_id].reviews.push(review);
        return acc;
    }, {});

    return (
        <div>
            <h3>All Movie Reviews</h3>
            {Object.keys(groupedReviews).map((movieId) => {
                const movieData = groupedReviews[movieId];
                return (
                    <div key={movieId} className="review-section">
                        <h4>{movieData.movie_title}</h4>
                        <img
                            className="movie-poster"
                            src={`https://image.tmdb.org/t/p/w500${movieData.movie_poster}`}
                            alt={movieData.movie_title}
                        />
                        <div>
                            {movieData.reviews.map((review) => (
                                <div key={review.review_id || review.timestamp} className="review-card">
                                    <p>
                                        <strong>{review.stars} ★</strong>
                                    </p>
                                    <p>
                                        <i>
                                            By {review.user_email} on{" "}
                                            {new Date(review.timestamp).toLocaleString()}
                                        </i>
                                    </p>
                                    <p>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AllReviews;
