import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('access_token');
            if (savedToken) {
                try {
                    // Verify token is still valid
                    const decoded = jwtDecode(savedToken);
                    if (decoded.exp * 1000 < Date.now()) {
                        // Token expired
                        logout();
                    } else {
                        // Fetch current user
                        const userData = await authService.getCurrentUser();
                        setUser(userData);
                        setToken(savedToken);
                    }
                } catch (error) {
                    console.error('Failed to restore session:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authService.login(username, password);
            const { access_token } = data;

            localStorage.setItem('access_token', access_token);
            setToken(access_token);

            // Fetch user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const isDocent = () => {
        return user?.role === 'docent' || user?.role === 'admin';
    };

    const isStudent = () => {
        return user?.role === 'student';
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isDocent,
        isStudent,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
