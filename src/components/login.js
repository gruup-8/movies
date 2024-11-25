import React, { useState } from "react";
import { loginScreen } from "../services/user";

function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await loginScreen(email, password);
            alert('Login successful');
            onLogin();
        } catch (error) {
            alert(`Error logging in: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type='submit'>Login</button>
        </form>
    );
}

export default LoginForm;
