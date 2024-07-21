import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer = styled.div`
  width: 100%;
  background-color: #333;
  color: white;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin: 0 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const Author = styled.div`
  margin-right: 20px;
  font-weight: bold;
`;

const Navbar = () => {
  return (
    <NavbarContainer>
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/research">Research Findings</NavLink>
      </NavLinks>
      <Author>Sam Chakraborty</Author>
    </NavbarContainer>
  );
};

export default Navbar;
