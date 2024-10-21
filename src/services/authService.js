import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const register = async (username, password) => {
    console.log('Attempting to register:', username, 'API_URL:', API_URL);
    const response = await axios.post(`${API_URL}/register`, {
        username: username,
        password: password
    }, {
        withCredentials: true
    });
    console.log('Registration response:', response.data);
    return response.data;
};

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password }, {
        withCredentials: true
    });
    return response.data;
};
