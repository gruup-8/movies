import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PublicFavoritesPage = () => {
    const { userId } = useParams();
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPublicFavorites() {
            try {
                const response = await fetch(`http://localhost:3001/favorites/public/share/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch public favorites list');
                }
                const data = await response.json();
                setFavorites(data);
            } catch (err) {
                setError(err.message);
            }
        }

        if (userId) {
            fetchPublicFavorites();
        }
    }, [userId]);

    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Public Favorites of User {userId}</h2>
            {favorites.length === 0 ? (
                <p>No favorites found.</p>
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
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default PublicFavoritesPage;