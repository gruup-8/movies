import {React, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Navbar.css';
import logo from '../assets/cozy-couch.png';
import { handleLogout } from "../services/user";

const Navbar = ({ isLoggedIn,  setIsLoggedIn, setUser }) => {
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        const logoutSuccess = await handleLogout();
        if (logoutSuccess) {
            setIsLoggedIn(false);
            setUser(null);
            navigate('/');
        } else {
            console.error('Logout failed');
        }
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src={logo} alt="Cozy Couch Logo" />
                </div>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/movies">Movies</Link></li>
                    <li><Link to="/reviews">Reviews</Link></li>
                    <li><Link to="/showtimes">Showtimes</Link></li>
                    <li><Link to="/groups">Groups</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                </ul>
                <div className="auth-links">
                {isLoggedIn ? (
                    <button onClick={handleLogoutClick}>Logout</button>
                ) : (
                    <>
                    <Link to="/login">
                    <button>Login/Signup</button>
                    </Link>
                    <Link to="/about">
                    <button>About</button>
                    </Link>
                    </>
                )}
                </div>
            </nav>
    )
}

export default Navbar;