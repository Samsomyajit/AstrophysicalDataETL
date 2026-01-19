import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  width: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: ${props => props.$active ? '#00d4ff' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  padding: 20px 18px;
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.$active ? '80%' : '0'};
    height: 3px;
    background: linear-gradient(90deg, #00d4ff, #0066ff);
    border-radius: 3px 3px 0 0;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);

    &::after {
      width: 80%;
    }
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;

  .emoji {
    font-size: 1.5rem;
  }

  span {
    background: linear-gradient(90deg, #00d4ff, #9370DB);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Author = styled.div`
  margin-right: 25px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  
  strong {
    color: #00d4ff;
  }
`;

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <NavbarContainer>
      <Logo to="/">
        <span className="emoji">🌌</span>
        <span>AstroViz</span>
      </Logo>
      <NavLinks>
        <NavLink to="/" $active={isActive('/')}>
          🏠 Home
        </NavLink>
        <NavLink to="/orbital-simulation" $active={isActive('/orbital-simulation')}>
          🪐 Orbital Simulation
        </NavLink>
        <NavLink to="/space-map" $active={isActive('/space-map')}>
          🗺️ Space Map
        </NavLink>
        <NavLink to="/orbital-tracking" $active={isActive('/orbital-tracking')}>
          🛰️ Tracking
        </NavLink>
        <NavLink to="/research" $active={isActive('/research')}>
          📚 Research
        </NavLink>
      </NavLinks>
      <Author>by <strong>Sam Chakraborty</strong></Author>
    </NavbarContainer>
  );
};

export default Navbar;
