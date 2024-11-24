import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AreasMenu = ({ onAreaSelect }) => {
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/areas');
                console.log(response.data);
                setAreas(response.data);
            } catch (err) {
                console.error('Error getting areas: ', err);
            }
        };
        fetchAreas();
    }, []);

    const handleSelect = (event) => {
        const areaId = event.target.value;
        setSelectedArea(areaId);
        onAreaSelect(areaId);
    };

    return (
        <div>
            <label htmlFor="area-dropdown">Select Area:</label>
            <select id="area-dropdown" value={selectedArea} onChange={handleSelect}>
                <option value="">-- Select Area --</option>
                {areas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                        {area.area_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AreasMenu;