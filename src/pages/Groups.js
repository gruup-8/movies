import React from "react";
import { Route, Routes } from "react-router-dom";
import GroupManagement from "../components/groupManagement";
import GroupMovies from "../components/GroupMovies";
import '../styles/Groups.css';



const Groups = () => {
    
    
return (
    <div className="groups">
        <Routes>
            <Route path="/" element={<GroupManagement />} />
            <Route path="/:groupId" element={<GroupManagement />} />
            <Route path="/group/custom" element={<GroupMovies />}/>
        </Routes>
    </div>
    )
}


export default Groups