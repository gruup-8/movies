import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import MovieList from './components/MovieList';
import GenreDropdown from './components/GenreDropdown';
import Pagination from './components/Pagination';
import MoviePage from './services/api';
import Showtimes from './components/showtimes';
import MovieDetails from './components/movieDetails';
import LoginForm from './components/login';
import RegisterForm from './components/register';
import GroupManagement from './components/groupManagement';
import { isAuthenticated, logout } from './services/authService';
import About from './pages/About.js';
import Movies from './pages/Movies.js';
import FavoritesPage from './components/Favorites';
import PublicFavoritesPage from './components/PublicFavorites.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const navigate = useNavigate();

  sessionStorage.getItem('userId');
  
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/'); // Redirect to the homepage after logout
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/'); // Redirect to the homepage after login
  };

  return (
    
      <div className="App">
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<h1>Welcome to Cozy Couch</h1>} />
        <Route path="/movies" element={<Movies />} />

        {/* Public Route: Movies and Showtimes (always accessible) */}
        <Route
          path="/"
          element={
            <div>
              <Showtimes />
              <h1>Movies</h1>
              <MoviePage />

              {/* Conditionally render Group Management */}
              {isLoggedIn && (
                <>
                  <hr />
                  <h1>Your Groups</h1>
                  <GroupManagement />

                  <hr />
                  <h1>Favorites</h1>
                  <FavoritesPage />
                </>
              )}
            </div>
          }
        />
        {/* Route for movie details */}
        <Route path='/movie/:id' element={<MovieDetails />} />
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        {/* Public Route: Register */}
        <Route path="/register" element={<RegisterForm onLogin={handleLogin} />} />
        <Route path="/" element={<GroupManagement />} />
        <Route path="/groups/:groupId" element={<GroupManagement />} />

        <Route path="/about" element={<About />} />
        <Route path="/favorites/public/:userId" element={<PublicFavoritesPage />} />
      </Routes>
    </div>
  );
}

export default App;