import React, { useState } from "react";
import { registerScreen } from "../services/user";
import '../styles/Register.css';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerScreen(email, password);
            alert('Registered successfully');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="register">
            <h1>Register</h1>
        <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
            <label>Email</label>
            <input
            type='email'
            placeholder='Set Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            </div>
            <div className="form-group">
            <label>Password</label>
            <input
            type='password'
            placeholder='Set Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            </div>
            <button type='submit' className="register-button">Register</button>
        </form>
        </div>
    );
}

export default RegisterForm;