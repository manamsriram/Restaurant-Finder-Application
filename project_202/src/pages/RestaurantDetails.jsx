import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const RestaurantDetails = () => {
  const { rid } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const StarRating = ({ rating }) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return <Rating isGood={rating >= 4}>{stars}</Rating>;
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
      return "$$";  // Default if menu parsing fails
    }
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Fetch basic restaurant details
        const restaurantResponse = await fetch(`http://127.0.0.1:8000/restaurants/${rid}`);
        const restaurantData = await restaurantResponse.json();
        setRating(restaurantData.overall_rating || 0);
        setRestaurant(restaurantData);

        // Fetch menu
        const menuResponse = await fetch(`http://127.0.0.1:8000/restaurants/${rid}/menu`);
        const menuData = await menuResponse.json();
        console.log('Menu data:', menuData);
        setMenu(menuData);

        // Fetch reviews
        const reviewsResponse = await fetch(`http://127.0.0.1:8000/restaurants/${rid}/reviews`);
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [rid]);

  if (isLoading) return <div>Loading...</div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <DetailContainer>
      <RestaurantHeader>
        <h1>{restaurant.name}</h1>
        <Rating isGood={rating >= 4}>★ {Number(rating || 0).toFixed(1)}</Rating>
      </RestaurantHeader>

      <InfoSection>
        <p>{restaurant.description}</p>
        <p>Address: {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}{restaurant.state ? `, ${restaurant.state}` : ''}</p>
        <p>Zipcode: {restaurant.zip_code}</p>
        <p>Hours: {restaurant.opentime} - {restaurant.closetime}</p>
        <p>Price Range: {restaurant.price_range || getPriceRange(restaurant.menu)}</p>
        <ContactInfo>
            <PhoneNumber>📞 {restaurant.phone}</PhoneNumber>
        </ContactInfo>
      </InfoSection>

      <PhotoSection>
        <h2>Photo Gallery</h2>
        {restaurant.photos && restaurant.photos.length > 0 ? (
            <PhotoGrid>
            {restaurant.photos.map((photo, index) => (
                <PhotoCard key={index}>
                <RestaurantImage src={photo.image} alt={photo.description || 'Restaurant photo'} />
                {photo.description && <PhotoCaption>{photo.description}</PhotoCaption>}
                </PhotoCard>
            ))}
            </PhotoGrid>
        ) : (
            <NoPhotos>No photos available</NoPhotos>
        )}
      </PhotoSection>

      <MenuSection>
        <h2>Menu</h2>
        {menu && typeof menu === 'object' && Object.keys(menu).length > 0 ? (
            Object.entries(menu).map(([categoryName, category], index) => (
                <MenuCategory key={index}>
                    <h3>{categoryName}</h3>
                    {category.items && category.items.map((item, itemIndex) => (
                        <MenuItem key={itemIndex}>
                            <div>
                                <span>{item.name}</span>
                                {item.description && <p>{item.description}</p>}
                            </div>
                            <span className="price">${item.price}</span>
                        </MenuItem>
                    ))}
                </MenuCategory>
            ))
        ) : (
            <NoMenuInfo>No menu information available</NoMenuInfo>
        )}
      </MenuSection>

        <ReviewForm rid={rid}/>
        <ReviewsSection>
        <h2>Customer Reviews</h2>
        {reviews.length > 0 ? (
            reviews.map((review) => (
                <ReviewCard key={review.rvid}>
                    <ReviewHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ReviewerName>{review.username}</ReviewerName>
                        <StarRating rating={Number(review.rating)} />
                    </div>
                    <ReviewDate>{new Date(review.created).toLocaleDateString()}</ReviewDate>
                    </ReviewHeader>
                    <ReviewText>{review.comment}</ReviewText>
                </ReviewCard>
            ))
        ) : (
            <NoReviews>No reviews yet</NoReviews>
        )}
        </ReviewsSection>
    </DetailContainer>
  );
};

const ReviewForm = ({ rid }) => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const navigate = useNavigate();

    const StarInput = () => (
        <RatingInput>
        <label>Rating:</label>
        <StarContainer>
            {[1, 2, 3, 4, 5].map((star) => (
            <Star 
                key={star}
                onClick={() => setRating(star)}
                filled={star <= rating}
            >
                {star <= rating ? '★' : '☆'}
            </Star>
            ))}
        </StarContainer>
        </RatingInput>
    );

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        console.log(token);
      
      if (!token) {
        navigate('/login');
        return;
      }
  
      try {
        const response = await fetch(`http://127.0.0.1:8000/restaurants/${rid}/create_review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating, comment: text })
        });
  
        if (response.status === 403) {
          alert('Only customers can submit reviews');
          return;
        }
  
        if (!response.ok) { 
            console.log(response);
            throw new Error('Failed to submit review');
        }
        // Reset form and refresh reviews
        setRating(0);
        setText('');
        window.location.reload();
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review');
      }
    };
  
    return (
      <ReviewFormContainer>
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmit}>
          <StarInput/>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience..."
          />
          <SubmitButton type="submit">Submit Review</SubmitButton>
        </form>
      </ReviewFormContainer>
    );
  };
  
const ReviewFormContainer = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  
    h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }
  `;
  
const RatingInput = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  
    select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
  `;
  
const StarContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Star = styled.span`
  cursor: pointer;
  font-size: 1.5rem;
  color: ${props => props.filled ? '#48bb78' : '#cbd5e0'};
  
  &:hover {
    color: #48bb78;
  }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    margin-bottom: 1rem;
    resize: vertical;
  `;
  
const SubmitButton = styled.button`
    background: #48bb78;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
  
    &:hover {
      background: #38a169;
    }
  `;
 
const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const RestaurantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
  }
`;

const InfoSection = styled.section`
  margin-bottom: 2rem;
  line-height: 1.6;
  
  p {
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
`;

const ReviewsSection = styled.section`
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #2d3748;
  }
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  align-items: flex-start;
`;

const ReviewerName = styled.span`
  font-weight: bold;
  color: #2d3748;
  margin-right: 1rem;  // Add space between name and rating
`;

const Rating = styled.span`
  color: ${props => props.isGood ? '#48bb78' : '#f6ad55'};
  font-weight: bold;
  margin-left: 0.5rem;  // Add space to the left of rating
`;

const ReviewDate = styled.span`
  color: #718096;
  font-size: 0.875rem;
`;

const ReviewText = styled.p`
  color: #4a5568;
  line-height: 1.5;
`;

const MenuSection = styled.section`
  margin: 2rem 0;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #2d3748;
  }
`;

const MenuCategory = styled.div`
  margin: 1.5rem 0;
  
  h3 {
    color: #2d3748;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #48bb78;
  }
`;

const MenuItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  
  div {
    flex: 1;
    color: #2d3748;  // Dark gray color for all text in the div
    
    span {
      font-weight: 500;
      display: block;
    }
    
    p {
      font-size: 0.875rem;
      color: #718096;  // Lighter gray for descriptions
      margin-top: 0.25rem;
    }
  }
  
  span.price {
    color: #48bb78;  // Green color only for price
    font-weight: bold;
    margin-left: 1rem;
  }
`;

const NoReviews = styled.p`
  text-align: center;
  color: #718096;
  font-size: 1.1rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PhotoSection = styled.section`
  margin: 2rem 0;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #2d3748;
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
`;

const PhotoCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PhotoCaption = styled.p`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const RestaurantImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const NoPhotos = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
`;

const ContactInfo = styled.div`
  margin-bottom: 1rem;
`;

const PhoneNumber = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NoMenuInfo = styled.div`
    text-align: center;
    padding: 2rem;
    color: #718096;
    background: #f7fafc;
    border-radius: 8px;
    border: 2px dashed #e2e8f0;
`;

export default RestaurantDetails;