import { getToken } from "./authService";
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3001/groups';

function getUserInfo() {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); 
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error);
        throw new Error('Failed to decode');
    }
}

export const fetchGroups = async () => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,      
        },
    });
    console.log('Response:', response);
    console.log('Request Headers:', response.headers);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch groups:', errorData); // Debug error response
        throw new Error(errorData.message || 'Failed to fetch groups');
    }
    const data = await response.json();
    console.log('Groups fetched:', data);

    if (!data.userGroups || !data.availableGroups) {
        console.error('API response missing userGroups or availableGroups');
        throw new Error('API response format is incorrect');
    }

    return {
        groups: data.userGroups,        // Groups the user is a creator of or a member of
        availableGroups: data.availableGroups,  // Groups that are available to join
    };
};

export const fetchGroupDetails = async (groupId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    let userId;
    try {
        const userInfo = getUserInfo();
        console.log('User Info:', userInfo); 
        userId = userInfo?.id;
        console.log('Decoded userId:', userId);
        if (!userId) {
            throw new Error('user id missing');
        }
    } catch (error) {
        console.error('Error decoding token:', error);
        throw new Error('Failed to decode token or fetch user info');
    }

    try {
        console.log('API Call URL:', `${API_URL}/${groupId}`);
        const response = await fetch(`${API_URL}/${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching details:', error);
        throw error;
    }
};

export const createGroup = async (name) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }
    return await response.json();
};

export const deleteGroup = async (groupId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    const { userId } = getUserInfo();
    console.log("Sending request with token:", token);
    
    const response = await fetch(`${API_URL}/${groupId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return await response.json();
};

export const sendJoinReq = async (groupId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    const { userId } = getUserInfo(); 
    
    const response = await fetch(`${API_URL}/${groupId}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData.message);
        throw new Error('Something went wrong');
    }
    return await response.json();
};

export const respondedToReq = async (groupId, userId, action) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/${groupId}/answer/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return response.json();
};

export const removeUser = async (groupId, userId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_URL}/${groupId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return response.json();
};

export const leaveGroup = async (groupId) => {
    const token = getToken();
    if (!token) {
        console.error('Cannot fetch groups: user is not authenticated.');
        throw new Error('User is not authenticated');
    }
    const { userId } = getUserInfo();
    
    const response = await fetch(`${API_URL}/${groupId}/member`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Could not leave group');
    }
    return await response.json();
};