import React, { useState } from "react";
import { registerScreen } from "../services/user";

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
        <form onSubmit={handleRegister}>
            <input
            type='email'
            placeholder='Set Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type='password'
            placeholder='Set Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type='submit'>Register</button>
        </form>
    );
}

export default RegisterForm;