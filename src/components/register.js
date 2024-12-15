import React, { useState } from "react";
import { registerScreen } from "../services/user";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
//pc@foo.com
//Pc12345!
import '../styles/Register.css';

const USER_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{1,63}\.(com|fi)$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validEmail) {
            alert('Invalid email format.');
            return;
        }
        if (!validPassword) {
            alert('Invalid password format.');
            return;
        }

        console.log('Email:', email); 
        console.log('Password:', password);

        try {
            const user = await registerScreen(email, password);
            console.log('user registered: ', user);
            alert('Registered successfully');
            navigate('/login');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const validateEmail = (value) => {
        setEmail(value);
        setValidEmail(USER_REGEX.test(value));
    };

    const validatePassword = (value) => {
        setPassword(value);
        setValidPassword(PWD_REGEX.test(value));
    };

    return (
        <div className="register">
            <h1>Register</h1>
        <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
            <label>Email</label>
            <div className="input-container">
            <input
            type='email'
            placeholder='Set Email'
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            required
            />
            <span className={validEmail ? "valid" : "invalid"}>
                <FontAwesomeIcon icon={validEmail ? faCheck : faTimes} />
            </span>
            </div>
            </div>
            <div className="form-group">
            <label>Password</label>
            <div className="input-container">
            <input
            type='password'
            placeholder='Set Password'
            value={password}
            onChange={(e) => validatePassword(e.target.value)}
            required
            />
            <span className={validPassword ? "valid" : "invalid"}>
                <FontAwesomeIcon icon={validPassword ? faCheck : faTimes} />
            </span>
            </div>
            </div>
            <button type='submit' className="register-button">Register</button>
        </form>
        <p>Already have an account?</p>
        <a href="/login">Login</a>
        </div>
    );
}

export default RegisterForm;