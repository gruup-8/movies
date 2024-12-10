import React from "react";
import { Route, Routes } from "react-router-dom";
import '../styles/Groups.css'
import GroupManagement from "../components/groupManagement";



const Groups = () => {
    
    
return (
    <div className="groups">
        <Routes>
            <Route path="/" element={<GroupManagement />} />
            <Route path="/:groupId" element={<GroupManagement />} />
        </Routes>
    </div>
    )
}


export default Groups