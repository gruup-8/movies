import React, { useEffect, useState } from "react";
import { deleteFromList, favoriteList, getShareLink, visibilityManager } from "../services/favorites";
import {jwtDecode} from 'jwt-decode';
import { getDecodedToken, getToken, isAuthenticated } from "../services/authService";
import { useParams } from 'react-router-dom';

const FavoritesPage = ({ userId: propUserId }) => {
    const [favorites, setFavorites] = useState([]);
    const [error, setError] =  useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(propUserId || null);
    const { sharedUserId } = useParams();

    const isPublicLink = !!sharedUserId;

    useEffect(() => {
        if (isPublicLink) {
            // If it's a public link, fetch favorites using the sharedUserId from the URL
            setUserId(sharedUserId);
        } else if (!userId && isAuthenticated()) {
            try {
                const decodedToken = getDecodedToken();
                setUserId(decodedToken.id);
                console.log("Decoded user ID:", decodedToken.id);
            } catch (err) {
                console.error("Failed to decode token:", err);
                setError("Invalid token. Please log in again.");
            }
        } else if (!userId) {
            setError("User ID is missing. Please log in.");
        }
        setLoading(false);
    }, [userId, sharedUserId, isPublicLink]);

      useEffect(() => {
        if (!userId) return;
    
        const fetchFavorites = async () => {
          try {
            const data  = isPublicLink ? await getShareLink(userId) : await favoriteList(userId);
            setFavorites(data);
          } catch (err) {
            setError(`Failed to load favorites: ${err.message}`);
          } finally {
            setLoading(false);
          }
        };
    
        fetchFavorites();
      }, [userId, isPublicLink]);

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
            const { frontendLink, data } = await getShareLink();
            setShareLink(frontendLink);
            console.log("Shareable link generated:", frontendLink);
            console.log("Movie data:", data);
            setFavorites(data);
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
                {favorites.map((favorite) => {
                    // Ensure a unique key for each list item
                    const key = favorite.movie_id ? `${favorite.movie_id}-${userId}` : `${favorite.title}-${Math.random()}`;
                    return (
                        <li key={key}>
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
                {!isPublicLink && (
                    <button onClick={ToggleVisibility}>
                        {isPublic ? 'Make Private' : 'Make public'}
                    </button>
                )}
                {message && <p>{message}</p>}
            </div>
            <div>
                <h2>Share Your Favorites</h2>
                {!isPublicLink && (
                    <button onClick={handleSharing}>Generate Share link</button>
                )}
                {shareLink && (
                    <p>
                        Shareable Link:{" "}
                        <a href={shareLink} target="_blank" rel="noopener noreferrer">
                            {shareLink}
                        </a>
                    </p>
                )}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default FavoritesPage;