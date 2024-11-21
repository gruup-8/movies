import React, { useEffect, useState } from 'react';
import axios from 'axios';

const fetchMovies = async (id) => {
    try {
        const response = await fetch(`/api/movies/${id}`);
        if (response.ok) {
            throw new Error('Movie not found cannot get');
        }
        const data = await response.json();
        console.log('Fetched movie:', data);
    } catch (error) {
        console.error('Error: ', error.message);
    }
    //Lisää alhaalle headerit ja kaikki tarvittava elokuvan näyttämiseen sen auettua.
    //movie-item on eventlisteneriä varten!
    return(
        <div class="movie-item">

        </div>
    );
};

