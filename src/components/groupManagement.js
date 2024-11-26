import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGroup, fetchGroupDetails, fetchGroups, leaveGroup, removeUser, sendJoinReq } from "../services/groups";
import { getUserId } from "../services/authService";

const GroupManagement = () => {
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
            if (groupId) {
                await loadGroupDetails();  
            } else {
                await loadGroups(); 
            }
        };

        loadData();  // Invoke the loadData function inside useEffect
    }, [groupId, userId]);

    const loadGroups = async () => {
        setIsLoading(true);
        try {
            const result = await fetchGroups(userId);
            setGroups(result);
        } catch (error) {
            setError('Error fetching groups: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadGroupDetails = async () => {
        try {
            const result = await fetchGroupDetails(groupId);
            setGroupDetails(result);
        } catch (error) {
            setError('Error fetching group info:' + error.message);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await createGroup(newGroupName, userId);
            loadGroups();
        } catch (error) {
            setError('Error creating group:' + error.message);
        }
    };

    const handleJoin = async (groupId) => {
        try {
            await sendJoinReq(groupId, userId);
            loadGroups();
        } catch (error) {
            setError('Error joining group: ' + error.message);
        }
    };

    const handleLeaving = async (groupId) => {
        try {
            await leaveGroup(groupId, userId);
            loadGroups();
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await removeUser(groupDetails.id, memberId);
            loadGroupDetails(); // Refresh group details after removing a member
        } catch (error) {
            setError("Error removing member: " + error.message);
        }
    };

    const isCreator = groupDetails?.creator_id === userId;
    if (groups.length === 0) {
        return <div>You have no groups.</div>;
    }

    return (
      <div>
            {isLoading && <div>Loading...</div>}
            {error && <div>{error}</div>}

            {groupDetails ? (
                <div>
                    <h2>Group Info</h2>
                    <p>Name: {groupDetails.name}</p>
                    <p>Creator: {groupDetails.creator_id}</p>
                    <ul>
                        {groupDetails?.members?.map((member) => (
                            <li key={member.id}>
                                {member.name}
                                {isCreator && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        Remove Member
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <button onClick={() => handleLeaving(groupDetails.id)}>
                        {isCreator ? "Delete Group" : "Leave Group"}
                    </button>
                </div>
            ) : (
                <div>
                    <h2>Your Groups</h2>
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                {group.name}
                                <button onClick={() => handleJoin(group.id)}>
                                    Join
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