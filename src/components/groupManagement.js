import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createGroup, fetchGroupDetails, fetchGroups, leaveGroup, removeUser, sendJoinReq } from "../services/groups";
import { getUserId } from "../services/authService";

const GroupManagement = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [groupDetails, setGroupDetails]  = useState(null);
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const userId = getUserId();

    useEffect(() => { 
        if (!userId) {
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
    }, [groupId, userId]);

    const loadGroups = async () => {
        try {
            const groupsData = await fetchGroups(userId); 
            console.log("Fetched groups:", groupsData);

            const uniqueGroups = Array.from(new Set(groupsData.map(group => group.id)))
            .map(id => groupsData.find(group => group.id === id));

        setGroups(uniqueGroups);
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
        } catch (error) {
            console.error('Error fetching group info:', error);
            setError('Error fetching group info:' + error.message);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await createGroup(newGroupName, userId);
            await loadGroups();
            setNewGroupName("");
        } catch (error) {
            setError('Error creating group:' + error.message);
            setError("Error creating group.");
        }
    };

    const handleJoin = async (groupId) => {
        try {
            console.log('Joining groupId:', groupId);
            await sendJoinReq(groupId, userId);
            console.log('Joined group successfully');
            await loadGroups(); // Refresh the group list
        } catch (error) {
            console.error('Error joining group:', error);
            setError('Error joining group: ' + error.message);
        }
    };

    const handleLeaving = async (groupId) => {
        try {
            await leaveGroup(groupId, userId);
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

    const isCreator = groupDetails?.creator_id === userId;

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
                    <ul>
                        {groups.length > 0 ? (
                            groups.map((group, index) => (
                                <li key={`${group.id}-${index}`}>
                                    <Link to={`/groups/${group.id}`}>{group.name}</Link>
                                    <button onClick={() => handleJoin(group.id)}>Join</button>
                                </li>
                            ))
                        ) : (
                            <div>You have no groups.</div>
                        )}
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