import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE_URL = 'http://localhost:3001';

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchAllReviews = async () => {
        try{
            const response = await fetch(`${BASE_URL}/review`);
            if(!response.ok){
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            setReviews(data);
        }catch(err){
            setError(err.message);
        }
      };

      fetchAllReviews();
    }, [])

    if(error){
        return <div>{error}</div>;
    }

    if(reviews.length === 0){
        return <div>No reviews available.</div>;
    }

    const groupedReviews = reviews.reduce((acc, review) => {
        if(!acc[review.movie_id]){
            acc[review.movie_id] = [];
        }
        acc[review.movie_id].push(review);
        return acc;
    }, {});

    return(
        <div>
            <h1>All Movie Reviews</h1>
            {Object.keys(groupedReviews).map((movieId) => (
                <div key={movieId}>
                    <h2>Movie ID: {movieId}</h2>
                    <div>
                        {groupedReviews[movieId].map((review) => (
                            <div key={review.id}>
                                <p><strong>{review.stars}  ★</strong></p>
                                <p><i>By {review.user_email} on {new Date(review.created_at).toLocaleString()}</i></p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );    
};

export default AllReviews;