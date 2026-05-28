import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { apiUrl } from '../lib/api';

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
        const response = await fetch(apiUrl('/restaurants'), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.status === 403) {
          alert('Access denied. Admin access required.');
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
      const response = await fetch(apiUrl(`/owner/admin-delete-listing/${rid}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete listing');

      setRestaurants((prev) => prev.filter((restaurant) => restaurant.rid !== rid));
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
      const response = await fetch(apiUrl('/owner/remove-duplicates'), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to remove duplicates');

      window.location.reload();
      alert('Duplicates removed successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove duplicates');
    }
  };

  if (isLoading) return <LoadingState className="rf-page">Loading...</LoadingState>;

  return (
    <AdminShell className="rf-page rf-fade-up">
      <AdminHero>
        <div>
          <Eyebrow>Platform control</Eyebrow>
          <h1>Admin Dashboard</h1>
          <p>
            Review all live listings, remove duplicates, and keep the catalog clean and consistent.
          </p>
        </div>
        <HeroActions>
          <HeroStat>
            <span>Listings</span>
            <strong>{restaurants.length}</strong>
          </HeroStat>
          <ActionButton type="button" onClick={handleRemoveDuplicates}>
            Remove Duplicates
          </ActionButton>
        </HeroActions>
      </AdminHero>

      <Grid>
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.rid}>
            <CardTop>
              <div>
                <RestaurantName>{restaurant.name}</RestaurantName>
                <Address>{restaurant.address}</Address>
              </div>
              <Badge>ID {restaurant.rid}</Badge>
            </CardTop>

            <CardMeta>
              <MetaItem>
                <label>City</label>
                <span>{restaurant.city || 'N/A'}</span>
              </MetaItem>
              <MetaItem>
                <label>Status</label>
                <span>{restaurant.status === '1' ? 'Active' : 'Inactive'}</span>
              </MetaItem>
              <MetaItem>
                <label>Rating</label>
                <span>{Number(restaurant.overall_rating ?? restaurant.rating ?? 0).toFixed(1)}</span>
              </MetaItem>
            </CardMeta>

            <CardActions>
              <LinkButton type="button" onClick={() => navigate(`/restaurant/${restaurant.rid}`)}>
                View
              </LinkButton>
              <DangerButton type="button" onClick={() => handleDeleteListing(restaurant.rid)}>
                Delete
              </DangerButton>
            </CardActions>
          </RestaurantCard>
        ))}
      </Grid>
    </AdminShell>
  );
};

const LoadingState = styled.div`
  padding: 2rem 0;
  font-size: 1.4rem;
`;

const AdminShell = styled.div`
  padding: 1.5rem 0 2rem;
`;

const AdminHero = styled.section`
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 1rem;
  padding: 1.4rem;
  border-radius: 24px;
  color: #fff;
  background:
    radial-gradient(circle at 8% 18%, rgba(194, 122, 58, 0.35), transparent 36%),
    var(--hero-gradient);
  box-shadow: 0 16px 40px rgba(31, 36, 33, 0.22);
  margin-bottom: 1rem;

  h1 {
    margin: 0.35rem 0 0.6rem;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.02;
  }

  p {
    margin: 0;
    max-width: 56ch;
    color: rgba(255, 255, 255, 0.86);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.div`
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.75;
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.85rem;
`;

const HeroStat = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);

  span {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.78);
  }

  strong {
    margin-top: 0.2rem;
    font-size: 1.75rem;
    font-family: 'Fraunces', serif;
  }
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.78rem 1rem;
  background: linear-gradient(125deg, #f4a300, #efbb53);
  color: #1f2421;
  font-weight: 800;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const RestaurantCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  border: 1px solid #eee2d5;
  box-shadow: 0 10px 28px rgba(31, 36, 33, 0.08);
  padding: 1rem;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.8rem;
`;

const RestaurantName = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
`;

const Address = styled.p`
  margin: 0.35rem 0 0;
  color: #60706a;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: #f8f4ec;
  color: #1f2421;
  font-size: 0.8rem;
  font-weight: 700;
`;

const CardMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  padding: 0.75rem;
  border-radius: 14px;
  background: #fcfaf5;
  border: 1px solid #eadfce;

  label {
    display: block;
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #66736d;
    margin-bottom: 0.2rem;
  }

  span {
    font-weight: 700;
    color: #1f2421;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const LinkButton = styled.button`
  flex: 1;
  border: 1px solid #d8cbbb;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: #fff;
  color: #1f2421;
  font-weight: 700;
  cursor: pointer;
`;

const DangerButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: linear-gradient(125deg, #c8384a, #e1606c);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

export default Admin;
