import { saveToken } from './authService';

export async function loginScreen(email, password, rememberMe) {
    try {
        const response = await fetch('http://localhost:3001/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok) {
            const { token } = data;  // Use the data you already parsed
            //console.log('Extracted userId:', userId);
            saveToken(token, rememberMe);
            //console.log('SessionStorage userId:', sessionStorage.getItem('userId'));
            console.log('token saved in sessionStorage:', token);
            return token;
        } else {
            console.error('Login failed:', data.message); // Debug log
            throw new Error(`Login failed: ${data.message}`);
        }

        //console.log('SessionStorage userId:', sessionStorage.getItem('userId'));
        //console.log('Extracted userId:', userId);
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

export async function registerScreen(email, password) {
    console.log("Registering with email:", email); // Debugging line
    console.log("Registering with password:", password); // Debugging line

    try {
        const response = await fetch('http://localhost:3001/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        console.log('Request payload:', { email, password });
        const data = await response.json();

        if (response.ok) {
            const { user } = data;
            console.log('Registered successfully: ', user);

            return user;
        } else {
            throw new Error(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error in registering:', error);
        throw error;
    }
}

export async function handleLogout() {
    const token = sessionStorage.getItem('authToken');
    try {
        const response = await fetch('http://localhost:3001/users/logout', {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
        });
        const data = await response.json();
        if (!response.ok) {
            console.log('Logout failed', data);
            throw new Error(data.message || 'Logout failed');
        }
        sessionStorage.removeItem('authToken'); // Clear the auth token
        console.log('Logout successful', data);

        return true;
    } catch (error) {
        console.error('Error logging out:', error);
        return false;
    }
}

export async function deleteUser(userId, token) {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:3001/users/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('User deleted successfully:', data);
            return data;
        } else {
            throw new Error(`Deleting account failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}


