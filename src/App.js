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
import { isAuthenticated } from './services/authService';
import About from './pages/About.js';
import Movies from './pages/Movies.js';
import FavoritesPage from './components/Favorites';
import PublicFavoritesPage from './components/PublicFavorites.js';
import Groups from './pages/Groups.js';
import Profile from './pages/profile.js';
import DeleteAccount from './components/deleteUser.js';
import Reviews from './pages/reviews.js';
import PublicFavorites from './pages/Favorites_public.js'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/'); // Redirect to the homepage after login
  };

  return (
    
      <div className="App">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
      <Routes>
        <Route path="/" element={<h1>Welcome to Cozy Couch</h1>} />
        <Route path="/movies/*" element={<Movies />} />
        <Route path="/reviews/*" element={<Reviews />} />
        <Route path='/showtimes/*' element={<Showtimes />} />

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
        <Route path="/groups" element={<Groups />} />
        <Route path="/" element={<GroupManagement />} />
        <Route path="/groups/:groupId" element={<GroupManagement />} />
        <Route 
          path="/profile/*" 
          element={
            isLoggedIn ? (
              <Profile userId={sessionStorage.getItem('userId')} groups={[]} DeleteAccount={DeleteAccount} />
            ) : (
              <div className='not-logged-in'>
                <h2>Please Login first</h2>
                <p>You need to have an account to view your profile</p>
                <Link to="/login">Login here</Link>
              </div>
            )            
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/favorites/public/:userId" element={<PublicFavoritesPage />} />
        <Route path="/favorites/public" element={<PublicFavorites />} />
      </Routes>
    </div>
  );
}

export default App;