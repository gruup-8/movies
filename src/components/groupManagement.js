import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createGroup, fetchGroupDetails, fetchGroups, leaveGroup, removeUser, respondedToReq, sendJoinReq } from "../services/groups";
import { getToken } from "../services/authService";
import { jwtDecode } from "jwt-decode";

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
                console.log('Fetching groups...');
                const groupsData = await fetchGroups(); 
                console.log("Fetched groups:", groupsData);
                setGroups(groupsData.groups || []);
                console.log("Updated groups state:", groups);
                setAvailableGroups(groupsData.availableGroups || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                setError("Error fetching groups.");
            }
        };

    const loadGroupDetails = async () => {
        try {
            console.log('Fetching details for groupId:', groupId);
            const result = await fetchGroupDetails(groupId);
            console.log('Fetched group details:', result);
            setGroupDetails(result);
            // Update requests if they exist
            if (result.requests) {
                setUpdatedRequests(result.requests);
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
            await loadGroups();
            setNewGroupName("");
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
        if(groupDetails?.requests) {
            setUpdatedRequests(groupDetails.requests);
        }
    }, [groupDetails]);

    const handleResponse = async (userId, action) => {
        try {
            const response = await respondedToReq(groupId, userId, action);
            setStatus(`Action "${action}" completed for user ${userId}`);
            console.log('Response to request:', response);

            setUpdatedRequests(prevRequests => 
                prevRequests.filter(request => request.userId !== userId)
            );
            await loadGroupDetails();
        } catch (err) {
            setError(err.message);
            console.error('Error responding to req:', err);
        }
    };

    const handleLeaving = async (groupId) => {
        try {
            await leaveGroup(groupId, token);
            await loadGroups();
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
        <div>
            {/* Group Details View */}
            {groupId && groupDetails ? (
                <div>
                    <h2>Group Info</h2>
                    <p>Name: {groupDetails.name}</p>
                    <p>Creator: {groupDetails.creator_id}</p>

                {isCreator && (
                    <div>
                        <h3>Join Requests</h3>
                        {error && <p style={{color: 'red'}}>{error}</p>}
                        {status && <p style={{ color: 'green' }}>{status}</p>}
                        <ul>
                            {updatedRequests?.length > 0? (
                                updatedRequests.map((request) => (
                                    <li key={request.userId}>
                                        <span>{request.userId}</span>
                                        <div>
                                            <button onClick={() => handleResponse(request.userId, 'accept')}>Accept</button>
                                            <button onClick={() => handleResponse(request.userId, 'decline')}>Decline</button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>No requests</p>
                            )}
                        </ul>
                    </div>
                )}                   
                    <h3>Group Members</h3>
                    <ul>
                        {groupDetails.members?.length > 0 ? (
                            groupDetails.members.map((member) => (
                                <li key={member.id}>
                                    {member.name}
                                    {isCreator && (
                                        <button onClick={() => handleRemoveMember(member.id)}>
                                            Remove Member
                                        </button>
                                    )}
                                </li>
                            ))
                        ) : (
                            <div>No members yet</div>
                        )}
                    </ul>
                    <button onClick={() => handleLeaving(groupDetails.id)}>
                        {isCreator ? "Delete Group" : "Leave Group"}
                    </button>
                    <button onClick={() => navigate("/")}>Back to Groups</button>
                </div>
            ) : (
                // Group List View
                <div>
                    <h2>Your Groups</h2>
                    <h3>Groups You Created</h3>
            <ul>
                {groups.filter((group) => group.status === 'creator').map((group) => (
                    <li key={group.id}  onClick={() => handleGroupClick(group.id)}>{group.name}</li>
                ))}
            </ul>

            <h3>Groups You Are a Member Of</h3>
            <ul>
                {groups
                    .filter((group) => group.status === 'member')
                    .map((group) => (
                        <li key={group.id} onClick={() => handleGroupClick(group.id)}>
                            {group.name}
                        </li>
                ))}
            </ul>

            <h3>Groups with Pending Requests</h3>
            <ul>
                {groups.filter((group) => group.status === 'pending').map((group) => (
                    <li key={group.id}>{group.name}</li>
                ))}
            </ul>
                <h3>Available Groups</h3>
                    <ul>
                    {availableGroups.map((group) => (
                    <li key={group.id}>
                        {group.name}
                        <button onClick={() => handleJoin(group.id)}>
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
                    />
                    <button onClick={handleCreateGroup}>Create Group</button>
                </div>
            )}

        </div>

    );
};
export default GroupManagement;