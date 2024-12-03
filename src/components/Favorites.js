import React, { useEffect, useState } from "react";
import { deleteFromList, favoriteList, getShareLink, visibilityManager } from "../services/favorites";
import {jwtDecode} from 'jwt-decode';
import { getDecodedToken, getToken, isAuthenticated } from "../services/authService";

const FavoritesPage = () => {
    //console.log('FavoritesPage Component Rendered');
    const [favorites, setFavorites] = useState([]);
    const [error, setError] =  useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        //console.log('Token:', token);

        if (token && isAuthenticated()) {
            try {
                const decodedToken = getDecodedToken();
                setUserId(decodedToken.id);
                //console.log('decoded user id:', decodedToken.id);
            } catch (error) {
                console.log('Failed to decode:', error);
                setError('Invalid token');
            }
        } else  {
            console.log('User not logged in');
            setError('Log in to access favorites');
        }
        setLoading(false); 
    }, []);

    useEffect(() => {
         if (userId) {
            async function fetchFavorites() {
                //console.log('Fetching favorites for userId:', userId);
                try {
                    const data = await favoriteList();
                    //console.log('Fetched favorites:', data);
                    setFavorites(data);
                } catch (err) {
                    setError(err.message);
                }
            }
            fetchFavorites();
        }
    }, [userId]);

    const handleDelete = async (movieId) => {
        try{
            await deleteFromList(movieId);
            setFavorites(favorites.filter((fav) => fav.movie_id !== movieId));
        } catch (err) {
            setError(err.message);
        }
    };

    const ToggleVisibility = async () => {
        try {
            await visibilityManager(!isPublic);
            setIsPublic(!isPublic);
            setMessage(`Favorites list is now ${!isPublic ? 'public' : 'private'}`);
        } catch (err) {
            setMessage(err.message);
        }
    };

    const handleSharing = async () => {
        try {
            const data = await getShareLink();
            setShareLink(data);
            //console.log('Generated shareable link:', `http://localhost:3000/favorites/public/share/${userId}`);
        } catch (err) {
            setMessage(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Favorites</h2>
            {favorites.length === 0 ? (
                <p>No favorites added yet.</p>
            ) : (
                
                <ul>
                    {/* Shows movie poster in a favorites window */}
                    {favorites.map((favorite) => {
                        //console.log('Rendering favorite:', favorite);
                        return (
                        <li key={favorite.movie_id}>
                            <h3>{favorite.title}</h3>
                            <img
                                src={`https://image.tmdb.org/t/p/w500${favorite.poster_path}`}
                                alt={favorite.title}
                                style={{ width: '100px', height: '150px' }}
                            />
                            <button onClick={() => handleDelete(favorite.movie_id)}>Delete</button>
                        </li>
                        );
                    })}
                </ul>
            )}
        <div>
                <h2>Visibility</h2>
                <button onClick={ToggleVisibility}>
                    {isPublic ? 'Make Private' : 'Make public'}
                </button>
                {message && <p>{message}</p>}
        </div>
        <div>
            <h2>Share Your Favorites</h2>
            <button onClick={handleSharing}>Generate Share link</button>
            {shareLink && (
                <p>
                    sharable Link: 
                    <a href={`http://localhost:3000/favorites/public/${userId}`} target="_blank" rel="noopener noreferrer">
                    {`http://localhost:3000/favorites/public/${userId}`}
                    </a>
                </p>
            )}
            {message && <p>{message}</p>}
        </div>

        </div>
    );
};

export default FavoritesPage;