import React from "react";
import { deleteUser, handleLogout } from "../services/user";
import { useNavigate } from "react-router-dom";

function DeleteAccount({ userId, onLogout }) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account?')) {
            try {
                await deleteUser(userId);
                alert('Account deleted successfully');

                await handleLogout();
                navigate('/');

            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    return (
    <button onClick={handleDelete}>Delete Account</button>
    );
}

export default DeleteAccount;