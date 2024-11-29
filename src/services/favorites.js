const API_URL = 'http://localhost:3001/favorites';

function getUserId() {
    return sessionStorage.getItem('userId');
}

export const favoriteList = async () => {
    const userId = getUserId();

    if (!userId) {
        console.error('No user ID found');
        throw new Error('User is not authenticated');
    }
    console.log('Fetching favorites list for user:', userId);

    try {

        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
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
    const userId = getUserId();
    console.log('Sending request to add favorite:', { userId, movieId });

    if (!userId) {
        throw new Error('User is not authenticated');
    }

    if (!movieId) {
        console.error('Movie ID is missing from the request');
        throw new Error('Movie ID is required');
    }
    console.log('Sending request to add favorite:', {
        userId,
        movieId,
    });

    const numericMovieId = Number(movieId); 

    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
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
    const userId = getUserId();
    if (!userId) throw new Error('User is not authenticated');

    const response = await fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });
    if (!response.ok) {
        throw new Error('could not delete movie');
    }
    return await response.json();
};

export const visibilityManager = async (ispublic) => {
    const userId = getUserId();

    const response = await fetch(`${API_URL}/public`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
        body: JSON.stringify({ ispublic }),
    });

    if (!response.ok) {
        throw new Error('could not change visibility');
    }
    return await response.json();
};

export const getShareLink = async (userId) => {
    if (!userId) throw new Error('Share URI is required');
    
    const response = await fetch(`${API_URL}/public/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });

    if (!response.ok) {
        throw new Error('could not get sharable link');
    }

    const data = await response.json();
    return data;
};