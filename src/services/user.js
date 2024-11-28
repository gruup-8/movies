import React, { useEffect, useState } from 'react';
import { getUserId } from './authService';

export async function loginScreen(email, password) {
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
        console.log('User object in response:', data.user);

        if (response.ok) {
            const userId = data.user.id;
            const userEmail = data.user.email;
            console.log('Extracted userId:', userId);
            console.log('Extracted userEmail:', userEmail);

            if (userId === undefined || userId === null) {
                    console.error('No userId found in login response:', data);
                    throw new Error('Login response is missing userId');
            }
            
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('userEmail', userEmail);
            console.log('SessionStorage userId:', sessionStorage.getItem('userId'));
            console.log('SessionStorage userEmail:', sessionStorage.getItem('userEmail'));
            return data;
        } else {
            console.error('Login failed:', data.message); // Debug log
            throw new Error(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

export async function registerScreen(email, password) {
    try {
        const response = await fetch('http://localhost:3001/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Registered successfully: ', data);
        } else {
            throw new Error(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error in registering:', error);
        throw error;
    }
}

export async function deleteUser(userId /*token*/) {
    try {
        //const token = sessionStorage.getItem('authToken');
        const userId = sessionStorage.getItem('userId');
        const response = await fetch('http://localhost:3001/users/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
                //Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.removeItem('userId');
            return data;
        } else {
            throw new Error(`Deleting account failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


