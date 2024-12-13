import React, { useEffect, useState } from "react";
import "../styles/Movies.css";

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
    const handleSubmit = (event) => {
        event.preventDefault();
        const extractedUserId = extractUserId(userLink);

        if (extractedUserId) {
            // Save the new link in local storage and update state
            const newLink = { userId: extractedUserId, link: userLink };
            const updatedLinks = [...savedLinks, newLink];
            setSavedLinks(updatedLinks);
            localStorage.setItem("favoriteLinks", JSON.stringify(updatedLinks));
            setUserLink(""); 
            setError(null); 
        } else {
            setError("Please enter a valid public favorites link.");
        }
    };

    // Load saved links from localStorage when the component mounts
    useEffect(() => {
        const storedLinks = localStorage.getItem("favoriteLinks");
        if (storedLinks) {
            setSavedLinks(JSON.parse(storedLinks)); 
        }
    }, []);

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
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PublicFavorites;
