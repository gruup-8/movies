import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Movies.css";
import Pagination from "../components/Pagination";
import { Route, Routes } from "react-router-dom";
import FavoritesPage from "../components/Favorites";
import DeleteAccount from "../components/deleteUser";
import { fetchUserDetails } from "../services/authService";
import { fetchUserGroups } from "../services/groupCustomization";

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
    <div>
      <div className="profile-info">
        <p>Email: {email}</p>
        <p>Groups:</p>
        <ul>
          {groups.map(group => (
            <li key={group.id}>
              <Link to={`/groups/${group.id}`}>
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="delete-account">
        <DeleteAccount userId={userId} />
      </div>
      <div>
        <h1>Favorites</h1>
        <FavoritesPage />
        <Routes>
          <Route
            path="/favorites"
            element={
              <div>
                <FavoritesPage />
              </div>
            }
          />
        </Routes>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Profile;