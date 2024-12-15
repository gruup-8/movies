import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createGroup, deleteGroup, fetchGroupDetails, fetchGroups, leaveGroup, removeUser, respondedToReq, sendJoinReq } from "../services/groups";
import { getToken } from "../services/authService";
import { jwtDecode } from "jwt-decode";
import AddToGroupPage from "./addToGroupPage";
import GroupMovies from "./GroupMovies";
import '../styles/GroupManagement.css';

const GroupManagement = ({requests}) => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [groupDetails, setGroupDetails]  = useState(null);
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);
    const [updatedRequests, setUpdatedRequests] = useState(groupDetails?.requests || []);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [yourGroups, setYourGroups] = useState([]);
    
    const token = getToken();

    const getUserId = () => {
        const token = getToken();
        try {
            const decoded = jwtDecode(token);
            return decoded?.id || null;
        } catch (err) {
            console.error("Error decoding token:", err);
            return null;
        }
    }
    const userId = getUserId();
    const isCreator = groupDetails?.creator_id === userId;

    useEffect(() => { 
        if (!token) {
          setError("You need to log in first");
          return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                if (groupId) {
                    await loadGroupDetails();  
                } else {
                    await loadGroups(); 
                }
            }catch (error) {
                console.error("Error loading data:", error);
                setError("Error loading data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();  // Invoke the loadData function inside useEffect
    }, [groupId, token]);

        const loadGroups = async () => {
            try {
                //console.log('Fetching groups...');
                const groupsData = await fetchGroups(); 
                //console.log("Fetched groups:", groupsData);
                setGroups(groupsData.groups || []);
                //console.log("Updated groups state:", groups);
                setAvailableGroups(groupsData.availableGroups || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                setError("Error fetching groups.");
            }
        };

    const loadGroupDetails = async () => {
        try {
            //console.log('Fetching details for groupId:', groupId);
            const result = await fetchGroupDetails(groupId);
            //console.log('Fetched group details:', result);
            setGroupDetails(result);
            // Update requests if they exist
            if (result.requests) {
                setUpdatedRequests(result.requests);
            }
            if (result.members.some((member) => member.user_id === userId)) {
                setYourGroups((prevGroups) => [...prevGroups, result]);
            }
        } catch (error) {
            console.error('Error fetching group info:', error);
            setError('Error fetching group info:' + error.message);
        }
    };

    const handleCreateGroup = async () => {
        try {
            const result = await createGroup(newGroupName);
            console.log('Group created:', result);
            setNewGroupName("");

            if (result && result.id) {
                setGroups((prevGroups) => [...prevGroups, result]); 
                setYourGroups((prevGroups) => [...prevGroups, result]);
            } else {
                console.error("Error: invalid group data");
            }
            
            await loadGroups();
        } catch (error) {
            setError('Error creating group:' + error.message);
        }
    };

    const handleJoin = async (groupId) => {
        try {
            console.log('Joining groupId:', groupId);
            await sendJoinReq(groupId);
            console.log('Joined group successfully');
            setAvailableGroups((prevGroups) => 
                prevGroups.map((group) => 
                    group.id === groupId ? { ...group, request_status: 'pending' } : group
                )
            );
        } catch (error) {
            console.error('Error joining group:', error);
            setError('Error joining group: ' + error.message);
        }
    };

    useEffect(() => {
        if (groupDetails?.requests) {
            setUpdatedRequests(groupDetails.requests);
        }
    }, [groupDetails]);

    const handleResponse = async (userId, action) => {
        try {
            setStatus('Processing...');
            setError('');

            const data = await respondedToReq(groupId, userId, action);

            if (data.status === 'accepted') {
                setGroupDetails((prevGroupDetails) => ({
                    ...prevGroupDetails,
                    members: [...prevGroupDetails.members, data.newMember], 
                    requests: prevGroupDetails.requests.filter((request) => request.userId !== userId),
                }));
            } else {
                setGroupDetails((prevGroupDetails) => ({
                    ...prevGroupDetails,
                    requests: prevGroupDetails.requests.filter((request) => request.userId !== userId),
                }));
            }

            setStatus(`Action "${action}" completed for user ${userId}`);
            await loadGroupDetails();
        } catch (err) {
            setError(err.message);
            console.error('Error responding to req:', err);
        }
    };

    const handleLeaving = async (groupId) => {
        try {
            await leaveGroup(groupId);

            setGroups((prevGroups) => prevGroups.map((group) => 
                group.id !== groupId));

            const groupToMove = groups.find((group) => group.id === groupId);
            setAvailableGroups((prevAvailableGroups) => [
                ...prevAvailableGroups,
               {...groupToMove, status: 'available'}
            ]);
            setYourGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
            await loadGroups();
            navigate("/groups");
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await removeUser(groupDetails.id, memberId);
            await loadGroupDetails(); // Refresh group details after removing a member
        } catch (error) {
            setError("Error removing member: " + error.message);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await deleteGroup(groupId);
            console.log('Group deleted successfully');

            setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
            setYourGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId)); // Remove group from "Your Groups"
            await loadGroups();
            navigate('/groups');
        } catch (error) {
            setError('Error deleting group: ' + error.message);
        }
    };

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);  // Navigate to group details page
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="group-management">
            {/* Group Details View */}
            {groupId && groupDetails ? (
                <div className="group-info">
                    <button onClick={() => navigate("/groups")} className="back-button">Back to Groups</button>
                    <h2>Group Info</h2>
                    <p>Name: {groupDetails.name}</p>
                    <p>Creator: {groupDetails.creator_id}</p>
    
                    {isCreator && (
                        <div className="join-requests">
                            <h3>Join Requests</h3>
                            {error && <p style={{color: 'red'}}>{error}</p>}
                            {status && <p style={{ color: 'green' }}>{status}</p>}
                            <ul>
                                {groupDetails?.requests ?.filter(request => request.status === 'pending').length > 0 ? (
                                    groupDetails.requests 
                                    .filter(request => request.status === 'pending')
                                    .map((request, index) => {
                                        const key = request.id && request.userId 
                                            ? `${request.id}-${request.userId}` 
                                            : `${index}-${Math.random()}`; 
    
                                        return (
                                            <li key={key}>
                                                <span>{request.userId}</span>
                                                <div>
                                                    {request.status === 'pending' ? (
                                                        <>
                                                            <button onClick={() => handleResponse(request.userId, 'accept')}>Accept</button>
                                                            <button onClick={() => handleResponse(request.userId, 'decline')}>Decline</button>
                                                        </>
                                                    ) : (
                                                        <span>{request.status}</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p>No requests</p>
                                )}
                            </ul>
                        </div>
                    )}      
                    <div className="group-members">             
                    <h3>Group Members</h3>
                    <ul>
                        {groupDetails.members?.length > 0 ? (
                            groupDetails.members.map((member, index) => {
                                const key = member.user_id ? `${member.user_id}-${groupDetails.id}` : `${index}-${Math.random()}`;
    
                                return (
                                    <li key={key}>
                                        {member.userId}
                                        {isCreator && member.userId !== groupDetails.creator_id && (
                                            <button onClick={() => handleRemoveMember(member.userId)}>
                                                Remove Member
                                            </button>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <div>No members yet</div>
                        )}
                    </ul>
                    </div>
                    <button onClick={() => {
                        if(isCreator){
                            handleDeleteGroup(groupDetails.id);
                        } else {
                            handleLeaving(groupDetails.id);
                        }
                    }} className="delete-button"
                    >
                        {isCreator ? "Delete Group" : "Leave Group"}
                    </button>                    
                    <div className="group-movies">
                    <button onClick={() => navigate("/groups")}>Back to Groups</button>
                    <h4>Groups movies</h4>
                    <GroupMovies groupId={groupId} />
                </div>
                </div>
            ) : (
                // Group List View
                <div className="group-management">
                    <h2>Your Groups</h2>
                    <h3>Groups you are a member of</h3>
                    <ul>
                        {groups.filter((group) => group.status === 'member').map((group) => (
                            <li key={group.id} onClick={() => handleGroupClick(group.id)} className="group-item">
                                {group.name}
                            </li>
                        ))}
                    </ul>
                    <h3>Groups You Created</h3>
                    <ul>
                        {groups.filter((group) => group.status === 'creator').map((group) => (
                            <li key={group.id} onClick={() => handleGroupClick(group.id)} className="group-item">{group.name}</li>
                        ))}
                    </ul>
                    <h3>Available Groups</h3>
                    <ul>
                        {availableGroups.map((group) => (
                            <li key={group.id} className="group-item">
                                {group.name}
                                <button onClick={() => handleJoin(group.id)} className="join-button">
                                    {group.request_status === 'available' ? 'Request to Join' : 'pending'}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <h2>Create a New Group</h2>
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="group-input"
                    />
                    <button onClick={handleCreateGroup} className="create-group-button">Create Group</button>
                </div>
            )}

        </div>

    );
};

    
export default GroupManagement;