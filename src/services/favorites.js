import { jwtDecode } from 'jwt-decode';
import { getToken } from './authService';

const API_URL = 'http://localhost:3001/favorites';

function getUserInfo() {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Invalid token:', error);
        throw new Error('Failed to decode');
    }
}

export const favoriteList = async () => {
    const token = getToken();

    if (!token) {
        throw new Error('User is not authenticated');
    }

    const { userId } = getUserInfo();
    console.log('Fetching favorites list for user:', userId);

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Request Headers:', response.headers); 
        console.log('Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to fetch favorites:', errorData); // Debug error response
            throw new Error(errorData.message || 'Failed to fetch favorites');
        }

        const data = await response.json();
        console.log('Favorites list fetched:', data);
    
        if (data.length === 0) {
            console.log('User has no favorites'); // Log this case for debugging
        }
    
        return data;

    } catch (error) {
        console.error('Error fetching list:', error);
        throw error;
    }
};

export const addFavorites = async (movieId) => {
    const token = getToken();

    console.log('Sending request to add favorite:', { token, movieId });

    if (!token) {
        throw new Error('User is not authenticated');
    }

    if (!movieId) {
        console.error('Movie ID is missing from the request');
        throw new Error('Movie ID is required');
    }
    const { userId } = getUserInfo();
    console.log('Fetching favorites list for user:', userId);

    const numericMovieId = Number(movieId); 

    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId: numericMovieId }),
    });

    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    const data = await response.json();
    console.log('Successfully added favorite:', data); // Log success response
    return data;
};

export const deleteFromList = async (movieId) => {
    if (!movieId) throw new Error('Movie ID is required to delete');
    const token = getToken();
    if (!token) throw new Error('User is not authenticated');

    const { userId } = getUserInfo();
    console.log('Fetching favorites list for user:', userId);

    const response = await fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('could not delete movie');
    }
    return await response.json();
};

export const visibilityManager = async (ispublic) => {
    const token = getToken();
    if (!token) throw new Error('User is not authenticated');

    const { userId } = getUserInfo();
    console.log('Fetching favorites list for user:', userId);

    const response = await fetch(`${API_URL}/public`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ispublic }),
    });

    if (!response.ok) {
        throw new Error('could not change visibility');
    }
    return await response.json();
};

export const getShareLink = async () => {
    const token = getToken();
    if (!token) throw new Error('Share URI is required');
    const { userId } = getUserInfo();
    const response = await fetch(`${API_URL}/public/share/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('could not get sharable link');
    }

    const data = await response.json();
    return data;
};