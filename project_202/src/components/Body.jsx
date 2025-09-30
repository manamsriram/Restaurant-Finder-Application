import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Body = ({ searchTerm }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    is_open: false,
    price_range: '',
    min_rating: 0,
    sort_by: 'rating',
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching restaurants...'); // Log before fetch
        const response = await fetch('http://localhost:8000/restaurants', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        
        const data = await response.json();
        console.log('Fetched data:', data); // Log the response data
        console.log('Restaurants array:', data.restaurants); // Log the restaurants array
        
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants);
      } catch (error) {
        console.error('Error details:', error); // Log detailed error
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle filtering and searching
  useEffect(() => {
    let filtered = [...restaurants];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  

    // Apply additional filters
    if (filters.is_open) {
      filtered = filtered.filter(restaurant => restaurant.status === 1);
    }

    if (filters.price_range) {
      filtered = filtered.filter(restaurant => restaurant.price === filters.price_range);
    }

    if (filters.min_rating > 0) {
      filtered = filtered.filter(restaurant => restaurant.rating >= filters.min_rating);
    }

    // Apply sorting
    if (filters.sort_by === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredRestaurants(filtered);
  }, [searchTerm, filters, restaurants]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return <LoadingContainer>...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>"error"</ErrorContainer>;
  }

  return (
    <MainContainer>
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Discover Great Restaurants
      </h2>
      
      {/* Filters Section */}
      <FiltersSection>
        <FilterGroup>
          <label>
            <input
              type="checkbox"
              checked={filters.is_open}
              onChange={(e) => handleFilterChange('is_open', e.target.checked)}
            />
            Open Now
          </label>
        </FilterGroup>

        <FilterGroup>
          <label>Price Range:</label>
          <select
            value={filters.price_range}
            onChange={(e) => handleFilterChange('price_range', e.target.value)}
          >
            <option value="">All</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </FilterGroup>

        <FilterGroup>
          <label>Minimum Rating:</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={filters.min_rating}
            onChange={(e) => handleFilterChange('min_rating', parseFloat(e.target.value))}
          />
        </FilterGroup>

        <FilterGroup>
          <label>Sort By:</label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
          >
            <option value="rating">Rating</option>
            <option value="date_added">Newest</option>
          </select>
        </FilterGroup>
      </FiltersSection>

      {/* Results Section */}
      {filteredRestaurants.length === 0 ? (
        <NoResults>No restaurants found matching your criteria.</NoResults>
      ) : (
        <RestaurantGrid>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.rid}>
              <CardContent>
                <RestaurantName>{restaurant.name}</RestaurantName>
                <Location>{restaurant.address}</Location>
                <Description>{restaurant.description}</Description>
                <InfoGrid>
                  <Rating isGood={restaurant.rating >= 4}>
                    ★ {Number(restaurant.rating).toFixed(1)}
                  </Rating>
                  <PriceRange>{restaurant.price}</PriceRange>
                  <Status isOpen={restaurant.status === 1}>
                    {restaurant.status === 1 ? 'Open' : 'Closed'}
                  </Status>
                </InfoGrid>
                <Hours>
                  {`${restaurant.opentime} - ${restaurant.closetime}`}
                </Hours>
              </CardContent>
            </RestaurantCard>
          ))}
        </RestaurantGrid>
      )}
    </MainContainer>
  );
};

const MainContainer = styled.main`
  flex-grow: 1;
  padding: 2rem;
  background-color: #f8f9fa;
`;

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const RestaurantCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  padding: 1.5rem;
`;

const RestaurantName = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const Location = styled.p`
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #718096;
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
  color: ${props => props.isGood ? '#48bb78' : '#f6ad55'};
  font-weight: bold;
`;

const PriceRange = styled.span`
  color: #4a5568;
  text-align: center;
`;

const Status = styled.span`
  color: ${props => props.isOpen ? '#48bb78' : '#f56565'};
  text-align: right;
  font-weight: bold;
`;

const Hours = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #e53e3e;
`;

const NoResults = styled.p`
  text-align: center;
  color: #718096;
  font-size: 1.2rem;
  margin-top: 2rem;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    color: #4a5568;
    font-weight: 500;
  }

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }

  input[type="number"] {
    width: 4rem;
    padding: 0.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    outline: none;
    
    &:focus {
      border-color: #4caf50;
      box-shadow: 0 0 0 1px #4caf50;
    }
  }

  select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    outline: none;
    background-color: white;
    cursor: pointer;
    
    &:focus {
      border-color: #4caf50;
      box-shadow: 0 0 0 1px #4caf50;
    }

    option {
      padding: 0.5rem;
    }
  }
`;

export default Body;