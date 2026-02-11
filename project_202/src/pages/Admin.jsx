import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRestaurants = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://54.67.35.1/restaurants', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.status === 403) {
                    alert("Access denied. Admin access required.");
                    navigate('/');
                    return;
                }

                if (!response.ok) throw new Error('Failed to fetch restaurants');

                const data = await response.json();
                setRestaurants(data.restaurants);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurants();
    }, [navigate]);

    const handleDeleteListing = async (rid) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://54.67.35.1/owner/admin-delete-listing/${rid}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete listing');

            setRestaurants(prev => prev.filter(restaurant => restaurant.rid !== rid));
            alert('Restaurant deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete restaurant');
        }
    };

    const handleRemoveDuplicates = async () => {
        if (!window.confirm('Are you sure you want to remove all duplicate listings?')) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://54.67.35.1/owner/remove-duplicates', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to remove duplicates');

            // Refresh the restaurant list
            window.location.reload();
            alert('Duplicates removed successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to remove duplicates');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleRemoveDuplicates}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                    Remove Duplicate Listings
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map(restaurant => (
                    <div key={restaurant.rid} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-bold">{restaurant.name}</h2>
                            <button
                                onClick={() => handleDeleteListing(restaurant.rid)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </div>
                        <p className="text-gray-600">{restaurant.address}</p>
                        <p className="text-sm text-gray-500 mt-2">ID: {restaurant.rid}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;