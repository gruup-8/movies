import React, { useEffect, useState } from 'react';
import { addMovieToGroup, fetchUserGroups } from '../services/groupCustomization';

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
                const userGroups = response.userGroups || [];  // Extract userGroups from the response
                setGroups(userGroups);  // Set only the userGroups array to the state
            } catch (err) {
                console.error('Error loading groups:', err);
                setErrorMessage('Failed to load groups.');
            }
        };
    
        loadGroups();
    }, []);

    const getFullShowtime = () => {
        if (!showtime) return {};

        return {
            show_time: new Date(showtime.startTime).toISOString(),  // Map startTime to show_time
            movie_title: showtime.title,    // Map title to movie_title
            theatre_name: showtime.theatre, // Map theatre to theatre_name
            picture: showtime.pic_link, 
        };
    };

    const handleAddToGroup = async () => {
        if (!selectedGroup) {
            setErrorMessage('Please select a group.');
            return;
        }
        let payload;
        if (showtime) {
            const fullShowtime = getFullShowtime();
            console.log('Showtime object before sending:', fullShowtime);

            if (!fullShowtime.show_time || !fullShowtime.theatre_name || !fullShowtime.movie_title) {
                setErrorMessage('Showtime details are incomplete.');
                return;
        }
        payload = { showtime: fullShowtime };
    } else if (movieId) {
        payload = { movie_id: movieId };
    } else {
        setErrorMessage('No movie or showtime');
        return;
    }
        
        setIsLoading(true);
        try {
            console.log('Adding movie to group with data:', {
                selectedGroup,
                ...payload
            });
            // Add the movie to the group
            await addMovieToGroup(selectedGroup, payload);
            setErrorMessage('');
            setSuccessMessage('Movie successfully added to the group!');
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