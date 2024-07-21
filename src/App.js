import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Research from './Pages/Research';
import Navbar from './components/Navbar';
import styled from 'styled-components';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const App = () => {
  return (
    <Router>
      <Navbar />
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
