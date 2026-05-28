import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';


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
    return "$$";  // Default if menu parsing fails
  }
};

const checkIfOpen = (openTime, closeTime, status) => {
  if (parseInt(status) === 0) {
    return false;
  }
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Convert restaurant times to minutes
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;
  
  return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
};

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const ratingValue = Number(restaurant.rating ?? restaurant.overall_rating ?? 0);
  const zipValue = restaurant.zip ?? restaurant.zip_code ?? '';
  const isCurrentlyOpen = checkIfOpen(restaurant.opentime, restaurant.closetime, restaurant.status);

  const handleClick = () => {
    navigate(`/restaurant/${restaurant.rid}`);
  };

  return (
    <StyledCard onClick={handleClick}>
      <CardContent>
        <RestaurantName>{restaurant.name}</RestaurantName>
        <Location>{restaurant.address} <br/> {zipValue}</Location>
        <Description>{restaurant.description}</Description>
        <InfoGrid>
          <Rating isgood={ratingValue >= 4}>
            ★ {ratingValue.toFixed(1)}
          </Rating>
          <PriceRange>{restaurant.price_range || getPriceRange(restaurant.menu)}</PriceRange>
          <Status isOpen={isCurrentlyOpen}>
            {isCurrentlyOpen ? 'Open' : 'Closed'}
          </Status>
        </InfoGrid>
        <Hours>
          {`${restaurant.opentime} - ${restaurant.closetime}`}
        </Hours>
      </CardContent>
    </StyledCard>
  );
};

const Body = ({ searchTerm, setSearchTerm }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZipCode, setIsZipCode] = useState(false);
  const [apiResults, setApiResults] = useState([]);
  const [filters, setFilters] = useState({
    is_open: false,
    price_range: '',
    min_rating: 0,
    sort_by: 'rating',
  });

  const resetSearch = () => {
    // Clear all applied filters
    setFilters({
      is_open: false,
      price_range: '',
      min_rating: 0,
      sort_by: 'rating',
    });
  
    // Reset the search term
    if (setSearchTerm) {
      setSearchTerm('');
    }
  
    // Reset the filtered list
    setFilteredRestaurants(restaurants);

    setIsZipCode(false);
    setApiResults([]);
  };

  useEffect(() => {
    console.log('searchTerm:', searchTerm);
    console.log('filters:', filters);
  }, [searchTerm, filters]);
  

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching restaurants...'); // Log before fetch
        const response = await fetch(apiUrl('/restaurants'), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
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
  
    // Search term filter
    if (searchTerm) {
      const isZip = /^\d{5}$/.test(searchTerm);
      if (isZip) {
        setIsZipCode(true);
        filtered = filtered.filter(restaurant => 
          restaurant.zip === parseInt(searchTerm)
        );
        
        const fetchGooglePlaces = async () => {
          try {
            const response = await fetch(
              apiUrl(`/restaurants/google-places/${searchTerm}`)
            );
              const data = await response.json();
              console.log('API Response:', data); // Log the entire response for debugging

            if (data.results) {
                setApiResults(data.results);
            } else {
                console.error('No results found in API response');
                setApiResults([]); // Set an empty array if no results are found
            }
          } catch (error) {
              console.error('Error fetching Google Places data:', error.response?.data || error.message);
          }
      };

          fetchGooglePlaces();
      } else {
        setApiResults([]);
        filtered = filtered.filter((restaurant) => {
          const searchTermLower = searchTerm.toLowerCase();
          const nameMatch = restaurant.name.toLowerCase().includes(searchTermLower);
          const addressMatch = restaurant.address.toLowerCase().includes(searchTermLower);
          const descriptionMatch = restaurant.description.toLowerCase().includes(searchTermLower);

          let menuMatch = false;
          if (restaurant.menu) {
            try {
              const menuItems = JSON.parse(restaurant.menu);
              menuMatch = menuItems.some(category => 
                category.items.some(item => 
                  item.name.toLowerCase().includes(searchTermLower) ||
                  item.description.toLowerCase().includes(searchTermLower)
                )
              );
            } catch (error) {
              console.error("Error parsing menu:", error);
            }
          }

          return nameMatch || addressMatch || descriptionMatch || menuMatch;
        });
      }
    }
  
    // Open/Closed filter
    if (filters.is_open) {
      filtered = filtered.filter(restaurant => {
        const isOpen = checkIfOpen(
          restaurant.opentime, 
          restaurant.closetime, 
          restaurant.status
        );
        return isOpen;
      });
    }
  
    // Price range filter
    if (filters.price_range) {
      filtered = filtered.filter(restaurant => {
        const calculatedPrice = getPriceRange(restaurant.menu);
        return calculatedPrice === filters.price_range;
      });
    }
  
    // Rating filter
    if (filters.min_rating > 0) {
      filtered = filtered.filter(restaurant => 
        parseFloat(restaurant.rating) >= filters.min_rating
      );
    }
  
    // Sorting
    if (filters.sort_by === 'rating') {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
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
      <HeroBanner className="rf-fade-up">
        <h2>Discover Your Next Great Meal</h2>
        <p>Search by neighborhood, dish, or ZIP and instantly compare ratings, price, and live opening status.</p>
      </HeroBanner>
      
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
            step="1"
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
            <RestaurantCard 
              key={restaurant.rid}
              restaurant={restaurant}
            />
          ))}
        </RestaurantGrid>
      )}

      {isZipCode && apiResults.length > 0 && (
        <div>
          <h3>External Results from Google Places</h3>
          <RestaurantGrid>
              {apiResults.map((place) => (
                  <StyledCard key={place.place_id}>
                      <CardContent>
                          <RestaurantName>{place.name}</RestaurantName>
                          <Location>{place.formatted_address}</Location>
                          <Rating isgood={place.rating >= 4}>
                              ★ {Number(place.rating).toFixed(1)}
                          </Rating> 
                          <Status isOpen={place.opening_hours?.open_now}>
                              {place.opening_hours?.open_now ? 'Open' : 'Closed'}
                          </Status>
                      </CardContent>
                  </StyledCard>
              ))}
          </RestaurantGrid>
      </div>
      )}


      {(searchTerm || filters.is_open || filters.price_range || filters.min_rating > 0) && (
        <ResetButton onClick={resetSearch}>
          Back to All Restaurants
        </ResetButton>
      )}

    </MainContainer>
  );
};

const MainContainer = styled.main`
  flex-grow: 1;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 2.2rem;
`;

const HeroBanner = styled.section`
  border-radius: 24px;
  padding: 1.6rem;
  margin-bottom: 1.2rem;
  color: #fff;
  background:
    radial-gradient(circle at 8% 18%, rgba(244, 163, 0, 0.4), transparent 40%),
    linear-gradient(130deg, #1f2421, #167a72);
  box-shadow: 0 14px 36px rgba(31, 36, 33, 0.25);

  h2 {
    font-size: clamp(1.65rem, 2.8vw, 2.35rem);
    line-height: 1.15;
    margin: 0;
  }

  p {
    margin: 0.75rem 0 0;
    color: rgba(255, 255, 255, 0.86);
    max-width: 780px;
  }
`;

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 1.1rem;
  padding: 0.4rem 0;
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
  line-height: 1.2;
  margin-bottom: 0.5rem;
  color: #1f2421;
`;

const Location = styled.p`
  color: #59655f;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #6d7973;
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
  color: ${props => props.isgood ? '#0d8665' : '#c7522a'};
  font-weight: bold;
`;

const PriceRange = styled.span`
  color: #48534e;
  text-align: center;
`;

const Status = styled.span`
  color: ${props => props.isOpen ? '#0d8665' : '#c8384a'};
  text-align: right;
  font-weight: bold;
`;

const Hours = styled.p`
  color: #6d7973;
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
  color: #55615b;
  font-size: 1.2rem;
  margin-top: 2rem;
`;

const FiltersSection = styled.div`
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(31, 36, 33, 0.1);
  margin-bottom: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    color: #3f4a45;
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
    border: 1px solid #d8d0c5;
    border-radius: 8px;
    outline: none;
    
    &:focus {
      border-color: #167a72;
      box-shadow: 0 0 0 1px #167a72;
    }
  }

  select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d8d0c5;
    border-radius: 8px;
    outline: none;
    background-color: #fff;
    cursor: pointer;
    
    &:focus {
      border-color: #167a72;
      box-shadow: 0 0 0 1px #167a72;
    }

    option {
      padding: 0.5rem;
    }
  }
`;

const ResetButton = styled.button`
  background-color: #fff;
  color: #1f2421;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  border: 1px solid #d6cec3;
  cursor: pointer;
  margin: 0.4rem 0 1rem;
  font-weight: 500;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StyledCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #efe6d9;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(31, 36, 33, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(31, 36, 33, 0.14);
  }
`;


export default Body;