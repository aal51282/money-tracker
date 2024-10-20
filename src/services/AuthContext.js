import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        return token ? { token, username } : null;
    });

    const loginUser = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setAuthData(data);
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setAuthData(null);
    };

    return (
        <AuthContext.Provider value={{ authData, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};