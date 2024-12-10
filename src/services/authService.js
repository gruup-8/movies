import { jwtDecode } from 'jwt-decode';

export const fetchUserDetails = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('User is not authenticated');
    }

    const response = await fetch('http://localhost:3001/users/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user details');
    }

    return await response.json();
};

export const getToken = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
        console.warn('getToken retrieved: null or undefined, user might not be logged in');
    }

    console.log('getToken retrieved:', token);
    return token;
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    const decoded = getDecodedToken();
    if (!decoded || !decoded.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp > currentTime;
};

export const saveToken = (token, rememberMe = false) => {
    if (rememberMe) {
        localStorage.setItem('authToken', token);
    } else {
        sessionStorage.setItem('authToken', token);
    }

    console.log('Token saved successfully: ', token);
};

export const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    console.log('user logged out. token cleared');
    window.location.href = '/login';
};

export const getDecodedToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        return decoded;
    } catch (error) {
        console.error('failed to decode token:', error);
        return null;
    }
};

/*
export const getUserId = () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId'); 
    if (!userId) {
        console.warn('getUserId retrieved: null or undefined. User might not be logged in.');
    }
    console.log('getUserId retrieved:', userId);
    return userId;  
};

export const isAuthenticated = () => {
    return !!getUserId();
};

export const logout = () => {
    sessionStorage.removeItem('userId');
    console.log('User logged out. sessionStorage cleared.');
    window.location.href = '/login'; // Redirect to login page
};
*/