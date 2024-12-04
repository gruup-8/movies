import React from "react";
import "../styles/Movies.css";
import Pagination from "../components/Pagination";
import { Route, Routes } from "react-router-dom";
import FavoritesPage from "../components/Favorites";

const Profile = () => {
    return (
        <div>
            <h1>Favorites</h1>
            <FavoritesPage />
        <Routes>
        <Route>
        {/* Public Route: Showtimes (always accessible) */}
        <Route
          path="/favorites"
          element={
            <div>
              <FavoritesPage />
            </div>
            }
            />
        </Route>
        </Routes>
        </div>
    )
}