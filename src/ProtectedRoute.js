import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './services/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authData } = useContext(AuthContext);

    if (!authData) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;