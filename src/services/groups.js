
const API_URL = 'http://localhost:3001/groups';

function getUserId() {
    return sessionStorage.getItem('userId');
}

export const fetchGroups = async () => {
    const userId = getUserId();

    const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch groups');
    }
    return await response.json();
};

export const fetchGroupDetails = async (groupId) => {
    const userId = getUserId();

    if (!userId) {
        throw new Error('User is not authenticated');
    }
    try {
        const response = await fetch(`${API_URL}/${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
            },
        });
        if (!response.ok) {
            throw new Error('Something went wrong');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching details:', error);
        throw error;
    }
};

export const createGroup = async (name) => {
    const userId = getUserId();

    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return await response.json();
};

export const deleteGroup = async (groupId) => {
    const userId = getUserId();

    const response = await fetch(`${API_URL}/${groupId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return await response.json();
};

export const sendJoinReq = async (groupId) => {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/${groupId}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return await response.json();
};

export const respondedToReq = async (groupId, userId, action) => {
    const creatorId = getUserId();
    const response = await fetch(`${API_URL}/${groupId}/answer/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': creatorId,
        },
        body: JSON.stringify({ action }),
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return response.json();
};

export const removeUser = async (groupId, userId) => {
    const creatorId = getUserId();
    const response = await fetch(`${API_URL}/${groupId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': creatorId,
        },
    });
    if (!response.ok) {
        throw new Error('Something went wrong');
    }
    return response.json();
};

export const leaveGroup = async (groupId) => {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/${groupId}/member`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
        },
    });
    if (!response.ok) {
        throw new Error('Could not leave group');
    }
    return await response.json();
};