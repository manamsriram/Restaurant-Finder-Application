import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const userString = localStorage.getItem("user");
    
    // Check if user data exists
    if (!userString) {
        return <h2 className='w-full m-auto text-center text-red-700 text-2xl font-extrabold'>You Need To Login First</h2>
    }

    // Parse the JSON string to an object
    const userInfo = JSON.parse(userString);
    
    // Now you can access the user_type property
    if (userInfo.user_type !== "owner") {
        return (
            <div className='w-full m-auto text-center text-red-700 text-2xl font-extrabold'>
                <h2>Access Denied.</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return children;
};

const AdminRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
        const checkAdmin = async () => {
            const userString = localStorage.getItem('user');
            if (!userString) {
                navigate('/login');
                return;
            }
  
            try {
                const userInfo = JSON.parse(userString);
                if (userInfo.user_type !== 'admin') {
                    navigate('/');
                    return;
                }
  
                setIsAdmin(true);
            } catch (error) {
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
  
        checkAdmin();
    }, [navigate]);
  
    if (isLoading) return <div>Loading...</div>;
    
    return isAdmin ? children : null;
};
export { ProtectedRoute, AdminRoute };