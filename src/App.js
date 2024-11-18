import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  function Showtimes() {
    const [showtimes, setShowtimes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getShowtimes() {
            try {
                const response = await fetch('http://localhost:3001/showtimes/fetch');
                if (!response.ok) {
                    throw new Error('Error fetching showtimes');
                }

                const data = await response.json();
                setShowtimes(data);
            } catch (error) {
                setError(error.message);
            }
        }

        getShowtimes();
    }, []);

    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Showtimes</h1>
            <ul>
                {showtimes.map(show => (
                    <li key={show.id}>
                        {show.title} - {show.theatre} - {show.startTime}
                    </li>
                ))}
            </ul>
        </div>
    );
  }

  const registerUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
         setMessage('User registered successfully');
      } else {
        setMessage(data.message || 'Failed to register user');
      }
    } catch (error) {
      setMessage('Error during registration');
      console.error(error);
    }
  };
  
  return (
    <div>
      <h1>Login</h1>
      <form>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter your email" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter your password" 
        />
        <button type="submit">Login</button>
      </form>

      <div>
        <p>{message}</p>
      </div>

      <Showtimes />  {/* Display the showtimes component here */}
    </div>
  );
}

export default App;
