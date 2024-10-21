import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const register = async (username, password) => {
    const response = await axios.post('https://money-tracker-backend-oc8t.onrender.com/api/register', {
        username: username,
        password: password
    });
    return response.data;
};

export const login = async (username, password) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { username, password });
    return response.data;
};
