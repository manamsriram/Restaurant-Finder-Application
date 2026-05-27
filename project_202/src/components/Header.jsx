import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Signup from './Signup';
import Login from './Login';

const Header = ({ setSearchTerm }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value;
    setSearchTerm(searchValue.trim());
  };

  const handleCloseModal = () => {
    setShowSignup(false);
    setShowLogin(false);
  };

  const renderModal = (content) => {
    if (typeof document === 'undefined') {
      return null;
    }

    return createPortal(content, document.body);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <HeaderShell className="rf-fade-up">
      <HeaderGlow />
      <TopBar className="rf-page">
        <BrandBlock to="/">
          <BrandEyebrow>RESTAURANT FINDER</BrandEyebrow>
          <BrandTitle>Taste The City</BrandTitle>
        </BrandBlock>

        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            name="search"
            placeholder="Name, dish, or ZIP code"
            autoComplete="off"
          />
          <SearchButton type="submit">Find</SearchButton>
        </SearchForm>

        <NavList>
          {user ? (
            <>
              <UserTag>Hi, {user.username}</UserTag>
              {user.user_type === 'owner' && <StyledNavLink to="/business">Dashboard</StyledNavLink>}
              {user.user_type === 'admin' && <StyledNavLink to="/admin">Admin</StyledNavLink>}
              <PlainButton type="button" onClick={handleLogout}>Log out</PlainButton>
            </>
          ) : (
            <>
              <StyledNavLink to="/business">Owner Portal</StyledNavLink>
              <PlainButton type="button" onClick={() => setShowLogin(true)}>Log in</PlainButton>
              <PrimaryButton type="button" onClick={() => setShowSignup(true)}>Create Account</PrimaryButton>
            </>
          )}
        </NavList>
      </TopBar>

      {showSignup && renderModal(
        <ModalBackdrop>
          <ModalCard>
            <CloseBtn onClick={handleCloseModal} aria-label="Close signup">&times;</CloseBtn>
            <Signup setShowLogin={setShowLogin} setShowSignup={setShowSignup} />
          </ModalCard>
        </ModalBackdrop>
      )}

      {showLogin && renderModal(
        <ModalBackdrop>
          <ModalCard>
            <CloseBtn onClick={handleCloseModal} aria-label="Close login">&times;</CloseBtn>
            <Login setShowLogin={setShowLogin} setUser={setUser} />
          </ModalCard>
        </ModalBackdrop>
      )}
    </HeaderShell>
  );
};

const HeaderShell = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  background: linear-gradient(110deg, rgba(31, 36, 33, 0.95), rgba(22, 122, 114, 0.86));
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
`;

const HeaderGlow = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 6% 30%, rgba(244, 163, 0, 0.24), transparent 35%),
    radial-gradient(circle at 90% 50%, rgba(255, 255, 255, 0.14), transparent 40%);
  pointer-events: none;
`;

const TopBar = styled.nav`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  min-height: 88px;
  padding: 1rem 0;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const BrandBlock = styled(NavLink)`
  display: inline-flex;
  flex-direction: column;
  color: #fff;
`;

const BrandEyebrow = styled.span`
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  opacity: 0.75;
`;

const BrandTitle = styled.span`
  font-size: 1.5rem;
  font-family: 'Fraunces', serif;
  font-weight: 700;
  line-height: 1.1;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 0.3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.68rem 1rem;
  color: #1f2421;
  font-size: 0.95rem;

  &::placeholder {
    color: #69746f;
  }
`;

const SearchButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.62rem 1rem;
  color: #fff;
  background: linear-gradient(125deg, #c7522a, #de6f32);
  font-weight: 700;
  cursor: pointer;
`;

const NavList = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const StyledNavLink = styled(NavLink)`
  color: #ecf7f3;
  font-weight: 600;
  padding: 0.48rem 0.75rem;
  border-radius: 999px;
  transition: background 180ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const UserTag = styled.span`
  color: #ecf7f3;
  font-weight: 600;
  padding: 0.48rem 0.75rem;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
`;

const PlainButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 999px;
  padding: 0.48rem 0.82rem;
  font-weight: 600;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  border: none;
  background: linear-gradient(125deg, #f4a300, #efbb53);
  color: #1f2421;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 22, 0.52);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 5rem 1rem 1.5rem;
  overflow-y: auto;
  z-index: 9999;
`;

const ModalCard = styled.div`
  width: min(480px, 100%);
  position: relative;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
  padding: 1.25rem;
  margin-top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  width: min(480px, 100%);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.8rem;
  font-size: 1.8rem;
  border: none;
  background: transparent;
  color: #5c6b64;
  cursor: pointer;
`;

export default Header;
