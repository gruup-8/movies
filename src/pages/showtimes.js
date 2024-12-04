import React from "react";
import "../styles/Movies.css";
import Pagination from "../components/Pagination";
import { Route, Routes } from "react-router-dom";
import Showtimes from "../components/showtimes";

const Showtimes = () => {
    return (
        <div>
            <h1>Showtimes</h1>
            <Showtimes />
        <Routes>
        <Route>
        {/* Public Route: Showtimes (always accessible) */}
        <Route
          path="/showtimes"
          element={
            <div>
              <Showtimes />
            </div>
            }
            />
        </Route>
        </Routes>
        </div>
    )
}