import React, { useState, useEffect } from 'react';
import { fetchUserGroups, addMovieToGroup } from '../services/groupCustomization';
import Showtimes from './showtimes';

const AddToGroupPage = ({ movieId, showtime }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadGroups = async () => {
            try {
                const response = await fetchUserGroups();
                //console.log('Fetched user groups:', response); // Log the full response to inspect it
                const userGroups = response.userGroups || [];  // Extract userGroups from the response
                setGroups(userGroups);  // Set only the userGroups array to the state
            } catch (err) {
                console.error('Error loading groups:', err);
                setErrorMessage('Failed to load groups.');
            }
        };
    
        loadGroups();
    }, []);

    const handleAddToGroup = async () => {
        if (!selectedGroup) {
            setErrorMessage('Please select a group.');
            return;
        }
    
        setIsLoading(true);
        try {
            // Ensure you are passing both movieId and showtime to the API call
            const response = await addMovieToGroup(selectedGroup, movieId, showtime); 
            setSuccessMessage(`Movie "${movieId}" successfully added to the group!`);
            setErrorMessage('');
            alert(`Movie "${movieId}" successfully added to the group!`);
        } catch (err) {
            console.error('Error adding movie to group:', err);
            setErrorMessage('Failed to add movie to the group.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-to-group">
            <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
            >
                <option value="">Select a group</option>
                {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name}
                    </option>
                ))}
            </select>
            <button onClick={handleAddToGroup} disabled={isLoading}>Add to Group</button>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AddToGroupPage;