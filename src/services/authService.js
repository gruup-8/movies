
export const getUserId = () => {
    const userId = sessionStorage.getItem('userId'); 
    return userId;  
};

export const isAuthenticated = () => {
    return !!getUserId();
};

export const logout = () => {
    sessionStorage.removeItem('userId');
};