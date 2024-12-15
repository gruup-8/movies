import React, { useEffect, useState } from "react";
import "../styles/Movies.css";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../services/authService";
import { getUserInfo } from "../services/favorites";

const PublicFavorites = () => {
    const [userLink, setUserLink] = useState("");
    const [savedLinks, setSavedLinks] = useState([]);
    const [error, setError] = useState(null);

    // Extract the userId from the public link
    const extractUserId = (link) => {
        const regex = /\/favorites\/public\/(\d+)/;
        const match = link.match(regex);
        return match ? match[1] : null;
    };

    // Handle form submission to add a public link
    const handleSubmit = async (event) => {
        event.preventDefault();
        const extractedUserId = extractUserId(userLink);

        if (extractedUserId) {
            try {
            const response = await fetch(`http://localhost:3001/favorites/public/share/${extractedUserId}`);
                if (!response.ok) {
                    throw new Error("This user's public favorites are unavailable.");
                }
            
            const newLink = { userId: extractedUserId, link: userLink };
            const updatedLinks = [...savedLinks, newLink];
            setSavedLinks(updatedLinks);
            localStorage.setItem("favoriteLinks", JSON.stringify(updatedLinks));
            setUserLink(""); 
            setError(null); 
            } catch (err) {
                setError("This public favorites link is not valid");
            }
        } else {
            setError("Please enter a valid public favorites link.");
        }
    };

    const handleDeleteLink = (linkToDelete, userToDelete) => {
        try {
            const { userId: loggedInUser } = getUserInfo();
            console.log("Logged-in user ID:", loggedInUser);
            console.log("User to delete ID:", userToDelete);

            if (String(loggedInUser) === String(userToDelete)) {
                const updatedLinks = savedLinks.filter((link) => link.link !== linkToDelete);
                setSavedLinks(updatedLinks);
                localStorage.setItem("favoriteLinks", JSON.stringify(updatedLinks));
            } else {
                setError("You can only delete your own favorite links.");
            }
        } catch (error) {
            setError("You must be logged in to delete the link.");
            console.error("Error during deletion:", error);
        }
    };

    // Load saved links from localStorage when the component mounts
    useEffect(() => {
        const storedLinks = localStorage.getItem("favoriteLinks");
        if (storedLinks) {
            setSavedLinks(JSON.parse(storedLinks)); 
        }
    }, []);

    const { userId: loggedInUser } = getUserInfo() || {};

    return (
        <div className="public-favorites">
            <h2>Share your favorites</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userLink">Enter Public Favorites Link:</label>
                <input
                    type="text"
                    id="userLink"
                    value={userLink}
                    onChange={(e) => setUserLink(e.target.value)}
                    placeholder="Paste your public favorites link here"
                    required
                />
                <button type="submit">Submit</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div>
                <h3>Public Favorites Links:</h3>
                {savedLinks.length === 0 ? (
                    <p>No public favorite links submitted yet.</p>
                ) : (
                    <ul>
                        {savedLinks.map((linkObj, index) => (
                            <li key={index}>
                                <a
                                    href={linkObj.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Public Favorites of User {linkObj.userId}
                                </a>
                                {String(loggedInUser) === String(linkObj.userId) && (
                                    <button onClick={() => handleDeleteLink(linkObj.link, linkObj.userId)}>Delete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PublicFavorites;
