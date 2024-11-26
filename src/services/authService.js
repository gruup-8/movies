
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