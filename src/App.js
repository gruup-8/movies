import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieList from './components/MovieList';
import GenreDropdown from './components/GenreDropdown';
import Pagination from './components/Pagination';
import cors from 'cors';
import MoviePage from './services/api';
import Showtimes from './components/showtimes';
import AreasMenu from './components/areas';
import MovieDetails from './components/movieDetails';

/*App.use(cors({
  origin: 'https://localhost:3000',
  methods: ['GET', 'POST'],
}));*/

function App() {
  return (
    <Router>
      <div id="container">
        <div className="App">
          <h3>Search Movies</h3>
          {/* Showtimes component is always visible */}
          <Showtimes />
        </div>

        <Routes>
          {/* Routes for navigating between components/pages */}
          <Route path="/" element={<MoviePage />} />
        </Routes>
      </div>
      <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetails />} />  
      </Routes>
    </Router>

  );
}

export default App;