import React, { useEffect } from "react";
import { useState } from "react";
import styled from 'styled-components';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export default function Business() {
    const [resturants, setResturants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResturants = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                navigate('/login');
                return;
            }
            
            try {
                const response = await fetch(apiUrl('/owner/view-listings'), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 403) {
                    alert("Access denied. Only business owners can access this page.");
                    navigate('/');
                    return;
                }

                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch restaurants');
                }

                const data = await response.json();
                setResturants(data);
            } catch (error) {
                console.error('Error details:', error);
                setResturants([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResturants();
    }, [navigate]);

    const handleDelete = (restaurantId) => () => {
        setSelectedRestaurant(restaurantId);
        setConfirmDelete(true);
    };
    
    const handleCloseModal = () => {
        setConfirmDelete(false);
        setSelectedRestaurant(null);
    };

    const getPriceRange = (menu) => {
        try {
          const menuData = JSON.parse(menu);
          let totalPrice = 0;
          let itemCount = 0;
          
          Object.values(menuData).forEach(category => {
            category.items.forEach(item => {
              totalPrice += item.price;
              itemCount++;
            });
          });
          
          const avgPrice = totalPrice / itemCount;
          if (avgPrice < 10) return "$";
          if (avgPrice < 20) return "$$";
          return "$$$";
        } catch {
          return "$$";
        }
      };
    
      const checkIfOpen = (openTime, closeTime, status) => {
        if (parseInt(status) === 0) {
            return false;
          }
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [openHour, openMinute] = openTime.split(':').map(Number);
        const [closeHour, closeMinute] = closeTime.split(':').map(Number);
        
        const openTimeInMinutes = openHour * 60 + openMinute;
        const closeTimeInMinutes = closeHour * 60 + closeMinute;
        
        return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
      };

    // Update the handleDelete function
    const handleConfirmDelete = async () => {
        const token = localStorage.getItem('access_token');
        
        try {
            const response = await fetch(apiUrl(`/owner/delete-listing/${selectedRestaurant}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to delete restaurant');
            }

            setResturants(resturants.filter(restaurant => restaurant.rid !== selectedRestaurant));
            alert('Restaurant deleted successfully');
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            alert('Failed to delete restaurant');
        } finally {
            setConfirmDelete(false);
            setSelectedRestaurant(null);
        }
    };

    if (isLoading) {
        return <h1 className='rf-page w-full m-auto text-4xl text-center pt-10'>Loading...</h1>
    }

    return (
        <div className='rf-page relative pt-4'>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h1 className='text-4xl'>Owner Dashboard</h1>
                <p className='cursor-pointer px-4 py-2 rounded-full text-white bg-[#c7522a]'>
                    <Link to={"/business/addNew"}>Add New Restaurant</Link>
                </p>
            </div>
            <ul>
                <RestaurantGrid>
                    {resturants.length > 0 ? (resturants.map((restaurant) => (
                        <RestaurantCard key={restaurant.rid}>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link to={`/edit/${restaurant.rid}`}>
                                        <FaEdit className="cursor-pointer text-xl text-green-400" />
                                    </Link>
                                    <MdDelete onClick={handleDelete(restaurant.rid)} className="cursor-pointer text-xl text-red-500" />
                                </div>
                                <div onClick={() => navigate(`/restaurant/${restaurant.rid}`)} className="cursor-pointer">
                                <RestaurantName>{restaurant.name}</RestaurantName>
                                <Location>{restaurant.address} <br/> {restaurant.zip}</Location>
                                <Description>{restaurant.description}</Description>
                                <InfoGrid>
                                    <Rating isGood={restaurant.rating >= 4}>
                                        ★ {Number(restaurant.rating).toFixed(1)}
                                    </Rating>
                                    <PriceRange>{getPriceRange(restaurant.menu)}</PriceRange>
                                    <Status isOpen={checkIfOpen(
                                    restaurant.opentime, 
                                    restaurant.closetime, 
                                    restaurant.status
                                    )}>
                                    {checkIfOpen(restaurant.opentime, restaurant.closetime, restaurant.status) 
                                        ? 'Open' 
                                        : 'Closed'}
                                    </Status>
                                </InfoGrid>
                                <Hours>
                                    {`${restaurant.opentime} - ${restaurant.closetime}`}
                                </Hours>
                                </div>
                            </CardContent>
                        </RestaurantCard>
                    ))) : (
                        <h1 className='w-full mx-auto text-xl text-center'>No restaurants found for this owner.</h1>
                    )}
                </RestaurantGrid>
            </ul>
            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto relative border border-[#ecdccf]">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-3 text-[#66736d] hover:text-black focus:outline-none"
                        >
                            &times;
                        </button>
                        <p className="text-[#1f2421] w-full text-center">Are you sure you want to delete this listing?</p>
                        <div className="flex justify-center gap-5 pt-5">
                            <button onClick={handleConfirmDelete} className='rf-btn rf-btn-primary'>Delete</button>
                            <button onClick={handleCloseModal} className='rf-btn rf-btn-muted'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}




const RestaurantGrid = styled.div`
  display: grid;
    grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
    gap: 1rem;
    padding: 0.5rem 0;
`;

const RestaurantCard = styled.div`
    background: #fff;
    border-radius: 16px;
    border: 1px solid #efe6d9;
  overflow: hidden;
    box-shadow: 0 12px 24px rgba(31, 36, 33, 0.08);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const RestaurantImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
    padding: 1.1rem;
`;

const RestaurantName = styled.h3`
    font-size: 1.3rem;
    font-family: 'Fraunces', serif;
  margin-bottom: 0.5rem;
    color: #1f2421;
`;

const Location = styled.p`
    color: #5e6a64;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
    color: #6e7a74;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Rating = styled.span`
    color: ${props => props.isGood ? '#0d8665' : '#c7522a'};
  font-weight: bold;
`;

const PriceRange = styled.span`
  color: #4a5568;
  text-align: center;
`;

const Status = styled.span`
    color: ${props => props.isOpen ? '#0d8665' : '#c8384a'};
  text-align: right;
  font-weight: bold;
`;

const Hours = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;