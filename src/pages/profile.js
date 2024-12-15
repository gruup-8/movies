import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Movies.css";
import "../styles/Profile.css"
import { Route, Routes } from "react-router-dom";
import FavoritesPage from "../components/Favorites";
import DeleteAccount from "../components/deleteUser";
import { fetchUserDetails } from "../services/authService";
import { fetchUserGroups } from "../services/groupCustomization";
import "../styles/Profile.css";

const Profile = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDetails = await fetchUserDetails();
        setEmail(userDetails[0].email);
        setUserId(userDetails[0].id);

        const userGroups = await fetchUserGroups();
        setGroups(userGroups.userGroups);
      } catch (err) {
        setError(err.message);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="profile-management">
      <div className="profile-info">
        <p>Email: <span className="bold-text">{email}</span></p>
        <p>Groups</p>
        <ul>
          {groups.map(group => (
            <li key={group.id} className="group-item">
              <Link to={`/groups/${group.id}`} className="group-link">
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
     
      <div className="favorites-section">
        <h1>Favorites</h1>
        <FavoritesPage userId={userId}/>
      </div>
      <div className="delete-account">
        <DeleteAccount userId={userId} />
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Profile;