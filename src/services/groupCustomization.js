import { getToken } from "./authService";
const API_URL = 'http://localhost:3001';

// Fetch groups for the current user
export const fetchUserGroups = async () => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/groups`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    //console.log('Response status:', response.status); // Debugging
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching user groups:', errorData);
        throw new Error(errorData.message || 'Failed to fetch user groups.');
    }

    const data = await response.json();
    //console.log('Fetched groups:', data); // Debugging
    return data;
};


// Add movie to group page
export const addMovieToGroup  = async (groupId, payload) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    const requestBody = { group_id: groupId, ...payload };

    try{
        // Add the movie to the selected group
        const response = await fetch(`${API_URL}/custom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding movie to group:', errorData);
            throw new Error(errorData.message || 'Failed to add movie to group.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in addMovieToGroup:', error.message);
        throw error;
    }
};

// Fetch group movies
export const fetchGroupMovies = async (groupId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    try {
        const response = await fetch(`${API_URL}/custom/${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.log('Failed to fetch group movies:',data.message);
            throw new Error(data.message || 'Failed to fetch group movies');
        }

        return {
            movies: data.movies,
            showtimes: data.showtimes,
        };
    } catch (err) {
        console.error('Error fetching group movies:', err);
        throw err;
    }
};