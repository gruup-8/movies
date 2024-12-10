import React from "react";
import "../styles/Reviews.css";
import AllReviews from "../components/AllReviews";
import { useParams } from "react-router-dom";

const Reviews = () => {
    const { movieId } = useParams(); // Get movieId from the route
    return (
        <div>
            <h2>Movie Reviews</h2>
            <AllReviews />
        </div>
    )
}

export default Reviews;