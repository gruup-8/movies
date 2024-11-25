import React from "react";
import { deleteUser } from "../services/user";

function DeleteAccount({ userId }) {
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account?')) {
            try {
                await deleteUser(userId);
                alert('Account deleted successfully');
                window.location.reload();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    return <button onClick={handleDelete}>Delete Account</button>
}

export default DeleteAccount;