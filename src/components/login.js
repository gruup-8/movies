import React, { useState } from "react";
import { loginScreen } from "../services/user";
import '../styles/Login.css';

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
        <div className="login">
            <h1>Login</h1>
        <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
            <label>Email</label>
            <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            </div>
            <div className="form-group">
            <label>Password</label>
            <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            </div>
            <button type='submit' className="login-button">Login</button>
        </form>
        <div className="register-link">
            <p>Don't have an account?</p>
            <a href="/register">Register</a>
        </div>
        </div>
    );
}

export default LoginForm;
