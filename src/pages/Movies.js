import React from "react";
import "../styles/Movies.css";
import MovieList from "../components/MovieList";
import GenreDropdown from "../components/GenreDropdown";
import Pagination from "../components/Pagination";
import MoviePage from "../services/api";
import { Route, Routes } from "react-router-dom";
import Showtimes from "../components/showtimes";



const Movies = () => {
    return (
        <div>
            <h1>Movies</h1>
            <MoviePage />
        <Routes>
        <Route>
        {/* Public Route: Movies and Showtimes (always accessible) */}
        <Route
          path="/movies"
          element={
            <div>
                <GenreDropdown />
              <Showtimes />
              <h1>Movies</h1>
              <MoviePage />
              <MovieList />
              <Pagination />
            </div>
            }
            />
        </Route>
        </Routes>
        </div>
    )
}

export default Movies;