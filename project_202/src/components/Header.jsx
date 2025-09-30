import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Signup from './Signup';
import Login from './Login';

const Header = ({ setSearchTerm }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value;
    if (searchValue.trim()) {
      setSearchTerm(searchValue);
    }
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowSignup(false);
    setShowLogin(false);
  };

  return (
    <header className="bg-gray-600 text-white p-4">
      <NavContainer>
        <NavLink to="/" className="font-bold mb-1">Restaurant Finder</NavLink>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            name="search"
            placeholder="Search restaurants..."
            autoComplete="off"
          />
          <SearchButton type="submit">
            Search
          </SearchButton>
        </SearchForm>
        <NavList>
          <NavItem>
            <StyledNavLink to="/business">Business Owner?</StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledButton onClick={handleLoginClick}>Login</StyledButton>
          </NavItem>
          <NavItem>
            <StyledButton onClick={handleSignupClick}>Signup</StyledButton>
          </NavItem>
        </NavList>
      </NavContainer>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              &times;
            </button>
            <Signup />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              &times;
            </button>
            <Login />
          </div>
        </div>
      )}
    </header>
  );
};

// Styled Components
const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-left: 1rem;
  padding: 0.3rem 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  color: inherit;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  width: 300px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: #888;
    opacity: 1;
  }

  &:focus {
    border-color: #4caf50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #45a049;
  }
`;

const StyledButton = styled.button`
  background-color: red;
  color: white;
  font-size: 15px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #045a3d;
  }
`;

export default Header;