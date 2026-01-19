import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Research from './Pages/Research';
import OrbitalSimulation from './Pages/OrbitalSimulation';
import SpaceMap from './Pages/SpaceMap';
import OrbitalTracking from './Pages/OrbitalTracking';
import Navbar from './components/Navbar';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #0a0a1a;
`;

const App = () => {
  return (
    <Router>
      <AppContainer>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/orbital-simulation" element={<OrbitalSimulation />} />
          <Route path="/space-map" element={<SpaceMap />} />
          <Route path="/orbital-tracking" element={<OrbitalTracking />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
