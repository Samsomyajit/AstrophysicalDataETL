import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

// ============================================================================
// API CONFIGURATION
// ============================================================================
// To use real-time data, configure the following API keys:
// 
// N2YO API (Satellite Tracking):
//   - Register at https://www.n2yo.com/ and get your API key from profile page
//   - Base URL: https://api.n2yo.com/rest/v1/satellite/
//   - Endpoints: 
//     - /tle/{id} - Get Two Line Elements
//     - /positions/{id}/{lat}/{lng}/{alt}/{seconds} - Get satellite positions
//     - /visualpasses/{id}/{lat}/{lng}/{alt}/{days}/{min_visibility} - Get visual passes
//     - /radiopasses/{id}/{lat}/{lng}/{alt}/{days}/{min_elevation} - Get radio passes
//     - /above/{lat}/{lng}/{alt}/{radius}/{category} - Get satellites above location
//
// OpenSky Network API (Aircraft Tracking):
//   - Register at https://opensky-network.org/ for higher rate limits
//   - Base URL: https://opensky-network.org/api
//   - Endpoint: /states/all (anonymous access available with limits)
//
// Create a .env file based on .env.example and set your API keys
const API_CONFIG = {
  N2YO_API_KEY: process.env.REACT_APP_N2YO_API_KEY || '',
  N2YO_BASE_URL: 'https://api.n2yo.com/rest/v1/satellite',
  OPENSKY_BASE_URL: 'https://opensky-network.org/api',
  OPENSKY_USERNAME: process.env.REACT_APP_OPENSKY_USERNAME || '',
  OPENSKY_PASSWORD: process.env.REACT_APP_OPENSKY_PASSWORD || '',
  // Observer location for satellite passes (configurable via environment variables)
  OBSERVER_LAT: parseFloat(process.env.REACT_APP_OBSERVER_LAT) || 40.7128,
  OBSERVER_LNG: parseFloat(process.env.REACT_APP_OBSERVER_LNG) || -74.0060,
  OBSERVER_ALT: parseFloat(process.env.REACT_APP_OBSERVER_ALT) || 0,
  // Automatically use simulated data when N2YO API key is not configured
  get USE_SIMULATED_DATA() {
    return !this.N2YO_API_KEY;
  }
};

// N2YO Satellite Categories for the "above" endpoint
// Full list available at https://www.n2yo.com/api/
const N2YO_CATEGORIES = {
  ALL: 0,
  BRIGHTEST: 1,
  ISS: 2,
  WEATHER: 3,
  NOAA: 4,
  GOES: 5,
  EARTH_RESOURCES: 6,
  SEARCH_RESCUE: 7,
  DISASTER_MONITORING: 8,
  TRACKING_DATA_RELAY: 9,
  GEOSTATIONARY: 10,
  INTELSAT: 11,
  GORIZONT: 12,
  RADUGA: 13,
  MOLNIYA: 14,
  IRIDIUM: 15,
  ORBCOMM: 16,
  GLOBALSTAR: 17,
  AMATEUR_RADIO: 18,
  EXPERIMENTAL: 19,
  GPS_OPERATIONAL: 20,
  GLONASS_OPERATIONAL: 21,
  GALILEO: 22,
  SATELLITE_AUGMENTATION: 23,
  NAVY_NAVIGATION: 24,
  RUSSIAN_LEO_NAVIGATION: 25,
  SPACE_EARTH_SCIENCE: 26,
  GEODETIC: 27,
  ENGINEERING: 28,
  EDUCATION: 29,
  MILITARY: 30,
  RADAR_CALIBRATION: 31,
  CUBESATS: 32,
  XM_SIRIUS: 33,
  TV: 34,
  BEIDOU: 35,
  YAOGAN: 36,
  WESTFORD_NEEDLES: 37,
  PARUS: 38,
  STRELA: 39,
  GONETS: 40,
  TSIKLON: 41,
  TSIKADA: 42,
  O3B_NETWORKS: 43,
  TSELINA: 44,
  CELESTIS: 45,
  IRNSS: 46,
  QZSS: 47,
  FLOCK: 48,
  LEMUR: 49,
  GPS_CONSTELLATION: 50,
  GLONASS_CONSTELLATION: 51,
  STARLINK: 52,
  ONEWEB: 53,
  CHINESE_SPACE_STATION: 54,
  QIANFAN: 55,
  KUIPER: 56,
  GEESAT: 57
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Fetch satellites above observer location using N2YO API
const fetchSatellitesAbove = async (categoryId = 0, searchRadius = 70) => {
  if (!API_CONFIG.N2YO_API_KEY) {
    console.warn('N2YO API key not configured. Using simulated data.');
    return null;
  }
  
  try {
    const url = `${API_CONFIG.N2YO_BASE_URL}/above/${API_CONFIG.OBSERVER_LAT}/${API_CONFIG.OBSERVER_LNG}/${API_CONFIG.OBSERVER_ALT}/${searchRadius}/${categoryId}?apiKey=${API_CONFIG.N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`N2YO API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching satellites from N2YO:', error);
    return null;
  }
};

// Fetch satellite TLE data using N2YO API
// Available for extended functionality (e.g., orbit calculations)
// eslint-disable-next-line no-unused-vars
const fetchSatelliteTLE = async (noradId) => {
  if (!API_CONFIG.N2YO_API_KEY) return null;
  
  try {
    const url = `${API_CONFIG.N2YO_BASE_URL}/tle/${noradId}?apiKey=${API_CONFIG.N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`N2YO API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching TLE from N2YO:', error);
    return null;
  }
};

// Fetch satellite positions using N2YO API
const fetchSatellitePositions = async (noradId, seconds = 10) => {
  if (!API_CONFIG.N2YO_API_KEY) return null;
  
  try {
    const url = `${API_CONFIG.N2YO_BASE_URL}/positions/${noradId}/${API_CONFIG.OBSERVER_LAT}/${API_CONFIG.OBSERVER_LNG}/${API_CONFIG.OBSERVER_ALT}/${seconds}?apiKey=${API_CONFIG.N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`N2YO API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching positions from N2YO:', error);
    return null;
  }
};

// Fetch visual passes using N2YO API
// Returns predicted visual passes for a satellite relative to observer location
const fetchVisualPasses = async (noradId, days = 10, minVisibility = 300) => {
  if (!API_CONFIG.N2YO_API_KEY) return null;
  
  try {
    const url = `${API_CONFIG.N2YO_BASE_URL}/visualpasses/${noradId}/${API_CONFIG.OBSERVER_LAT}/${API_CONFIG.OBSERVER_LNG}/${API_CONFIG.OBSERVER_ALT}/${days}/${minVisibility}?apiKey=${API_CONFIG.N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`N2YO API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching visual passes from N2YO:', error);
    return null;
  }
};

// Fetch radio passes using N2YO API
// Returns predicted radio passes for a satellite relative to observer location
// Available for extended functionality (e.g., ham radio operations)
// eslint-disable-next-line no-unused-vars
const fetchRadioPasses = async (noradId, days = 10, minElevation = 40) => {
  if (!API_CONFIG.N2YO_API_KEY) return null;
  
  try {
    const url = `${API_CONFIG.N2YO_BASE_URL}/radiopasses/${noradId}/${API_CONFIG.OBSERVER_LAT}/${API_CONFIG.OBSERVER_LNG}/${API_CONFIG.OBSERVER_ALT}/${days}/${minElevation}?apiKey=${API_CONFIG.N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`N2YO API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching radio passes from N2YO:', error);
    return null;
  }
};

// Fetch aircraft states from OpenSky Network API
// Supports optional authentication for higher rate limits
const fetchAircraftStates = async (boundingBox = null) => {
  try {
    let url = `${API_CONFIG.OPENSKY_BASE_URL}/states/all`;
    
    // Add bounding box filter if provided (reduces API load)
    if (boundingBox) {
      const { lamin, lomin, lamax, lomax } = boundingBox;
      url += `?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    }
    
    // Build fetch options with optional authentication
    const options = {};
    if (API_CONFIG.OPENSKY_USERNAME && API_CONFIG.OPENSKY_PASSWORD) {
      const credentials = btoa(`${API_CONFIG.OPENSKY_USERNAME}:${API_CONFIG.OPENSKY_PASSWORD}`);
      options.headers = {
        'Authorization': `Basic ${credentials}`
      };
    }
    
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`OpenSky API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching aircraft from OpenSky:', error);
    return null;
  }
};

// Unit conversion constants
const METERS_TO_FEET = 3.28084;
const MS_TO_KMH = 3.6;

// Transform OpenSky response to our airplane format
const transformOpenSkyData = (data) => {
  if (!data || !data.states) return [];
  
  return data.states
    .filter(state => state[5] !== null && state[6] !== null) // Filter out entries without position
    .slice(0, 50) // Limit to 50 aircraft for performance
    .map(state => ({
      callsign: (state[1] || 'Unknown').trim(),
      icao24: state[0],
      airline: state[2] || 'Unknown', // origin_country
      aircraft: 'Unknown', // OpenSky doesn't provide aircraft type
      origin: { code: 'N/A', city: state[2], lat: 0, lng: 0 },
      destination: { code: 'N/A', city: 'In Flight', lat: 0, lng: 0 },
      altitude: Math.round((state[7] || state[13] || 0) * METERS_TO_FEET), // Convert meters to feet
      speed: Math.round((state[9] || 0) * MS_TO_KMH), // Convert m/s to km/h
      heading: Math.round(state[10] || 0),
      lat: (state[6] || 0).toFixed(2),
      lng: (state[5] || 0).toFixed(2),
      progress: 'N/A',
      trajectory: [],
      verticalRate: state[11] || 0,
      onGround: state[8],
      squawk: state[14],
      timestamp: state[4],
      status: state[8] ? 'On Ground' : 'In Flight'
    }));
};

// Transform N2YO "above" response to our satellite format
const transformN2YOData = (data, body = 'Earth') => {
  if (!data || !data.above) return [];
  
  return data.above.map(sat => ({
    name: sat.satname,
    noradId: sat.satid,
    type: data.info?.category || 'Satellite',
    orbit: 'LEO',
    altitude: Math.round(sat.satalt),
    speed: 7.5, // Approximate speed, actual calculation would require TLE
    inclination: 0,
    period: 0,
    country: 'Unknown',
    body: body,
    lat: sat.satlat.toFixed(2),
    lng: sat.satlng.toFixed(2),
    intDesignator: sat.intDesignator,
    launchDate: sat.launchDate || 'Unknown',
    status: 'Active',
    trajectory: []
  }));
};

const PageContainer = styled.div`
  background: linear-gradient(135deg, #0d0d20 0%, #1a1a35 50%, #0d0d20 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
`;

const Header = styled.h2`
  text-align: center;
  color: #00d4ff;
  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  margin-bottom: 30px;
`;

const Description = styled.p`
  text-align: center;
  color: #aaa;
  max-width: 1000px;
  margin: 0 auto 30px;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: ${props => props.active ? 'linear-gradient(45deg, #00d4ff, #0066ff)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: ${props => props.active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto 30px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const CardTitle = styled.h3`
  color: ${props => props.color || '#00d4ff'};
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  th {
    color: #00d4ff;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  td {
    color: #ccc;
  }

  tr {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  tr:hover td {
    background: rgba(0, 212, 255, 0.1);
  }

  tr.selected td {
    background: rgba(0, 212, 255, 0.2);
  }
`;

const DataSourceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.isLive ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 215, 0, 0.2)'};
  border: 1px solid ${props => props.isLive ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255, 215, 0, 0.5)'};
  border-radius: 20px;
  font-size: 0.85rem;
  color: ${props => props.isLive ? '#4ECDC4' : '#FFD700'};
  margin: 0 auto 20px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isLive ? '#4ECDC4' : '#FFD700'};
    animation: ${props => props.isLive ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    switch(props.type) {
      case 'earth': return 'rgba(78, 205, 196, 0.3)';
      case 'moon': return 'rgba(192, 192, 192, 0.3)';
      case 'mars': return 'rgba(255, 107, 107, 0.3)';
      case 'airplane': return 'rgba(255, 215, 0, 0.3)';
      default: return 'rgba(147, 112, 219, 0.3)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'earth': return '#4ECDC4';
      case 'moon': return '#C0C0C0';
      case 'mars': return '#FF6B6B';
      case 'airplane': return '#FFD700';
      default: return '#9370DB';
    }
  }};
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(0,212,255,0.2), rgba(0,100,255,0.05)'});
  padding: 20px;
  border-radius: 12px;
  text-align: center;

  .icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.valueColor || '#00d4ff'};
  }

  .label {
    color: #888;
    font-size: 0.85rem;
    margin-top: 5px;
  }
`;

const DetailPanel = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 25px;
  margin-top: 20px;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    color: #00d4ff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 68, 68, 0.3);
    }
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 10px;

  .label {
    color: #888;
    font-size: 0.85rem;
    margin-bottom: 5px;
  }

  .value {
    color: ${props => props.color || '#fff'};
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const PlotContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ResearchLink = styled.div`
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.2), rgba(147, 112, 219, 0.05));
  border: 1px solid rgba(147, 112, 219, 0.3);
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  h4 {
    color: #9370DB;
    margin-bottom: 15px;
    font-size: 1.3rem;
  }

  p {
    color: #aaa;
    line-height: 1.6;
    margin-bottom: 15px;
  }

  a {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(45deg, #9370DB, #6B48DC);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(147, 112, 219, 0.4);
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? 'linear-gradient(45deg, #00d4ff, #0066ff)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: ${props => props.active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

// Simulated satellite data for Earth, Moon, and Mars
const generateSatelliteData = () => {
  const satellites = [];
  
  // Earth satellites
  const earthSatellites = [
    { name: 'ISS (ZARYA)', noradId: 25544, type: 'Space Station', orbit: 'LEO', altitude: 420, speed: 7.66, inclination: 51.6, period: 92.9, country: 'International' },
    { name: 'STARLINK-1234', noradId: 44238, type: 'Communication', orbit: 'LEO', altitude: 550, speed: 7.59, inclination: 53.0, period: 95.6, country: 'USA' },
    { name: 'HUBBLE', noradId: 20580, type: 'Telescope', orbit: 'LEO', altitude: 540, speed: 7.59, inclination: 28.5, period: 95.4, country: 'USA' },
    { name: 'GOES-16', noradId: 41866, type: 'Weather', orbit: 'GEO', altitude: 35786, speed: 3.07, inclination: 0.1, period: 1436.1, country: 'USA' },
    { name: 'GPS IIF-12', noradId: 41019, type: 'Navigation', orbit: 'MEO', altitude: 20200, speed: 3.87, inclination: 55.0, period: 717.9, country: 'USA' },
    { name: 'TIANGONG', noradId: 48274, type: 'Space Station', orbit: 'LEO', altitude: 390, speed: 7.68, inclination: 41.5, period: 92.2, country: 'China' },
    { name: 'LANDSAT 9', noradId: 49260, type: 'Earth Observation', orbit: 'LEO', altitude: 705, speed: 7.50, inclination: 98.2, period: 99.0, country: 'USA' },
    { name: 'SENTINEL-2B', noradId: 42063, type: 'Earth Observation', orbit: 'LEO', altitude: 786, speed: 7.45, inclination: 98.6, period: 100.6, country: 'ESA' },
    { name: 'INTELSAT 39', noradId: 44476, type: 'Communication', orbit: 'GEO', altitude: 35786, speed: 3.07, inclination: 0.0, period: 1436.1, country: 'International' },
    { name: 'IRIDIUM 180', noradId: 56730, type: 'Communication', orbit: 'LEO', altitude: 780, speed: 7.46, inclination: 86.4, period: 100.4, country: 'USA' },
    { name: 'COSMOS 2558', noradId: 53328, type: 'Military', orbit: 'LEO', altitude: 440, speed: 7.65, inclination: 97.5, period: 93.3, country: 'Russia' },
    { name: 'STARLINK-5432', noradId: 54321, type: 'Communication', orbit: 'LEO', altitude: 550, speed: 7.59, inclination: 53.0, period: 95.6, country: 'USA' },
  ];

  earthSatellites.forEach(sat => {
    satellites.push({
      ...sat,
      body: 'Earth',
      lat: (Math.random() * 180 - 90).toFixed(2),
      lng: (Math.random() * 360 - 180).toFixed(2),
      trajectory: generateTrajectory(sat.inclination, sat.altitude, 'earth'),
      launchDate: randomDate(new Date(2010, 0, 1), new Date(2024, 0, 1)),
      status: Math.random() > 0.1 ? 'Active' : 'Inactive'
    });
  });

  // Moon satellites/orbiters
  const moonSatellites = [
    { name: 'LRO', noradId: 35315, type: 'Orbiter', orbit: 'Lunar', altitude: 50, speed: 1.6, inclination: 85.0, period: 118.0, country: 'USA' },
    { name: 'CHANDRAYAAN-3', noradId: 57320, type: 'Orbiter', orbit: 'Lunar', altitude: 100, speed: 1.59, inclination: 85.0, period: 127.0, country: 'India' },
    { name: 'DANURI (KPLO)', noradId: 53377, type: 'Orbiter', orbit: 'Lunar', altitude: 100, speed: 1.59, inclination: 90.0, period: 127.0, country: 'South Korea' },
    { name: 'CAPSTONE', noradId: 52751, type: 'Pathfinder', orbit: 'NRHO', altitude: 1500, speed: 0.9, inclination: 75.0, period: 390.0, country: 'USA' },
  ];

  moonSatellites.forEach(sat => {
    satellites.push({
      ...sat,
      body: 'Moon',
      lat: (Math.random() * 180 - 90).toFixed(2),
      lng: (Math.random() * 360 - 180).toFixed(2),
      trajectory: generateTrajectory(sat.inclination, sat.altitude, 'moon'),
      launchDate: randomDate(new Date(2009, 0, 1), new Date(2024, 0, 1)),
      status: 'Active'
    });
  });

  // Mars satellites/orbiters
  const marsSatellites = [
    { name: 'MARS ODYSSEY', noradId: 26734, type: 'Orbiter', orbit: 'Martian', altitude: 400, speed: 3.4, inclination: 93.1, period: 118.0, country: 'USA' },
    { name: 'MRO', noradId: 28988, type: 'Orbiter', orbit: 'Martian', altitude: 300, speed: 3.42, inclination: 92.7, period: 112.0, country: 'USA' },
    { name: 'MAVEN', noradId: 40028, type: 'Orbiter', orbit: 'Martian', altitude: 150, speed: 3.5, inclination: 74.2, period: 277.0, country: 'USA' },
    { name: 'TIANWEN-1', noradId: 46234, type: 'Orbiter', orbit: 'Martian', altitude: 265, speed: 3.43, inclination: 87.0, period: 265.0, country: 'China' },
    { name: 'MARS EXPRESS', noradId: 27816, type: 'Orbiter', orbit: 'Martian', altitude: 298, speed: 3.42, inclination: 86.6, period: 420.0, country: 'ESA' },
    { name: 'HOPE (EMM)', noradId: 46120, type: 'Orbiter', orbit: 'Martian', altitude: 20000, speed: 1.0, inclination: 25.0, period: 3300.0, country: 'UAE' },
  ];

  marsSatellites.forEach(sat => {
    satellites.push({
      ...sat,
      body: 'Mars',
      lat: (Math.random() * 180 - 90).toFixed(2),
      lng: (Math.random() * 360 - 180).toFixed(2),
      trajectory: generateTrajectory(sat.inclination, sat.altitude, 'mars'),
      launchDate: randomDate(new Date(2001, 0, 1), new Date(2024, 0, 1)),
      status: 'Active'
    });
  });

  return satellites;
};

// Simulated airplane data
const generateAirplaneData = () => {
  const airlines = ['United', 'Delta', 'American', 'British Airways', 'Lufthansa', 'Air France', 'Emirates', 'Singapore Airlines', 'Qatar Airways', 'Cathay Pacific'];
  const airports = [
    { code: 'JFK', city: 'New York', lat: 40.64, lng: -73.78 },
    { code: 'LAX', city: 'Los Angeles', lat: 33.94, lng: -118.41 },
    { code: 'LHR', city: 'London', lat: 51.47, lng: -0.46 },
    { code: 'CDG', city: 'Paris', lat: 49.01, lng: 2.55 },
    { code: 'DXB', city: 'Dubai', lat: 25.25, lng: 55.36 },
    { code: 'SIN', city: 'Singapore', lat: 1.36, lng: 103.99 },
    { code: 'HND', city: 'Tokyo', lat: 35.55, lng: 139.78 },
    { code: 'SYD', city: 'Sydney', lat: -33.95, lng: 151.18 },
    { code: 'ORD', city: 'Chicago', lat: 41.98, lng: -87.90 },
    { code: 'FRA', city: 'Frankfurt', lat: 50.03, lng: 8.57 },
  ];
  const aircraftTypes = ['Boeing 777-300ER', 'Airbus A350-900', 'Boeing 787-9', 'Airbus A380-800', 'Boeing 737 MAX 8'];

  const airplanes = [];
  for (let i = 0; i < 15; i++) {
    const origin = airports[Math.floor(Math.random() * airports.length)];
    let destination = airports[Math.floor(Math.random() * airports.length)];
    while (destination.code === origin.code) {
      destination = airports[Math.floor(Math.random() * airports.length)];
    }
    
    const progress = Math.random();
    const currentLat = origin.lat + (destination.lat - origin.lat) * progress;
    const currentLng = origin.lng + (destination.lng - origin.lng) * progress;
    
    airplanes.push({
      callsign: `${airlines[Math.floor(Math.random() * airlines.length)].substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      origin: origin,
      destination: destination,
      altitude: Math.floor(Math.random() * 8000 + 30000), // 30,000 - 38,000 feet
      speed: Math.floor(Math.random() * 150 + 750), // 750 - 900 km/h
      heading: Math.floor(Math.random() * 360),
      lat: currentLat.toFixed(2),
      lng: currentLng.toFixed(2),
      progress: (progress * 100).toFixed(0),
      trajectory: [
        { lat: origin.lat, lng: origin.lng },
        { lat: currentLat, lng: currentLng },
        { lat: destination.lat, lng: destination.lng }
      ],
      departureTime: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      eta: new Date(Date.now() + Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      status: 'In Flight'
    });
  }
  return airplanes;
};

// Helper functions
function generateTrajectory(inclination, altitude, body) {
  const points = [];
  const bodyRadius = body === 'earth' ? 6371 : body === 'moon' ? 1737 : 3390;
  const orbitRadius = bodyRadius + altitude;
  
  for (let i = 0; i <= 360; i += 10) {
    const rad = (i * Math.PI) / 180;
    const incRad = (inclination * Math.PI) / 180;
    points.push({
      x: orbitRadius * Math.cos(rad),
      y: orbitRadius * Math.sin(rad) * Math.cos(incRad),
      z: orbitRadius * Math.sin(rad) * Math.sin(incRad)
    });
  }
  return points;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

const LiveTracking = () => {
  const [activeTab, setActiveTab] = useState('satellites');
  const [satellites, setSatellites] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemPasses, setSelectedItemPasses] = useState(null); // For visual/radio passes
  const [selectedItemPositions, setSelectedItemPositions] = useState(null); // For satellite positions
  const [bodyFilter, setBodyFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('simulated'); // 'simulated' or 'live'

  // Fetch satellite data from API or use simulated data
  const fetchSatelliteData = useCallback(async () => {
    if (API_CONFIG.USE_SIMULATED_DATA || !API_CONFIG.N2YO_API_KEY) {
      setSatellites(generateSatelliteData());
      setDataSource('simulated');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch satellites from different categories
      const [allSats] = await Promise.all([
        fetchSatellitesAbove(N2YO_CATEGORIES.ALL, 70)
      ]);

      if (allSats && allSats.above) {
        const transformedSats = transformN2YOData(allSats, 'Earth');
        // Combine with Moon and Mars satellites (simulated since N2YO only tracks Earth satellites)
        const moonMars = generateSatelliteData().filter(s => s.body !== 'Earth');
        setSatellites([...transformedSats, ...moonMars]);
        setDataSource('live');
      } else {
        // Fallback to simulated data
        setSatellites(generateSatelliteData());
        setDataSource('simulated');
      }
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      setSatellites(generateSatelliteData());
      setDataSource('simulated');
    }
    setIsLoading(false);
  }, []);

  // Fetch aircraft data from OpenSky API or use simulated data
  const fetchAircraftData = useCallback(async () => {
    if (API_CONFIG.USE_SIMULATED_DATA) {
      setAirplanes(generateAirplaneData());
      return;
    }

    try {
      // Fetch aircraft over a specific region (e.g., North Atlantic for transatlantic flights)
      // Using bounding box to limit API usage
      const aircraftData = await fetchAircraftStates({
        lamin: 25,
        lomin: -130,
        lamax: 55,
        lomax: -60
      });

      if (aircraftData) {
        const transformedAircraft = transformOpenSkyData(aircraftData);
        if (transformedAircraft.length > 0) {
          setAirplanes(transformedAircraft);
          setDataSource('live');
        } else {
          setAirplanes(generateAirplaneData());
        }
      } else {
        setAirplanes(generateAirplaneData());
      }
    } catch (error) {
      console.error('Error fetching aircraft data:', error);
      setAirplanes(generateAirplaneData());
    }
    setLastUpdate(new Date());
  }, []);

  // Initialize data
  useEffect(() => {
    fetchSatelliteData();
    fetchAircraftData();
    
    // Update data periodically (every 30 seconds for simulated, 60 seconds for live)
    const updateInterval = API_CONFIG.USE_SIMULATED_DATA ? 30000 : 60000;
    const interval = setInterval(() => {
      fetchAircraftData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fetchSatelliteData, fetchAircraftData]);

  // Filter satellites by celestial body
  const filteredSatellites = useMemo(() => {
    if (bodyFilter === 'all') return satellites;
    return satellites.filter(s => s.body.toLowerCase() === bodyFilter.toLowerCase());
  }, [satellites, bodyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const earthSats = satellites.filter(s => s.body === 'Earth');
    const moonSats = satellites.filter(s => s.body === 'Moon');
    const marsSats = satellites.filter(s => s.body === 'Mars');
    const activeSats = satellites.filter(s => s.status === 'Active');
    const avgAltitude = airplanes.reduce((sum, a) => sum + a.altitude, 0) / (airplanes.length || 1);
    const avgSpeed = airplanes.reduce((sum, a) => sum + a.speed, 0) / (airplanes.length || 1);

    return {
      totalSatellites: satellites.length,
      earthSatellites: earthSats.length,
      moonSatellites: moonSats.length,
      marsSatellites: marsSats.length,
      activeSatellites: activeSats.length,
      totalAirplanes: airplanes.length,
      avgAltitude: avgAltitude.toFixed(0),
      avgSpeed: avgSpeed.toFixed(0)
    };
  }, [satellites, airplanes]);

  // Handle item selection - fetch additional data when satellite is selected
  const handleSelectItem = useCallback(async (item, type) => {
    setSelectedItem({ ...item, itemType: type });
    setSelectedItemPasses(null);
    setSelectedItemPositions(null);
    
    // If a satellite is selected and we have API access, fetch additional data
    if (type === 'satellite' && item.noradId && !API_CONFIG.USE_SIMULATED_DATA) {
      try {
        // Fetch real-time positions (next 60 seconds)
        const positions = await fetchSatellitePositions(item.noradId, 60);
        if (positions && positions.positions) {
          setSelectedItemPositions(positions.positions);
        }
        
        // Fetch visual passes for the next 7 days
        const passes = await fetchVisualPasses(item.noradId, 7, 300);
        if (passes && passes.passes) {
          setSelectedItemPasses(passes.passes);
        }
      } catch (error) {
        console.error('Error fetching satellite details:', error);
      }
    }
  }, []);

  // Airplane 2D map visualization using Plotly scatter with airplane-like markers
  const airplaneMapData = useMemo(() => {
    const traces = [];
    
    // Add airplane markers
    traces.push({
      type: 'scatter',
      mode: 'markers+text',
      x: airplanes.map(a => parseFloat(a.lng)),
      y: airplanes.map(a => parseFloat(a.lat)),
      text: airplanes.map(a => a.callsign),
      textposition: 'top center',
      textfont: { size: 9, color: '#fff' },
      marker: {
        size: 14,
        color: airplanes.map(a => a.speed),
        colorscale: [[0, '#00d4ff'], [0.5, '#FFD700'], [1, '#FF6B6B']],
        showscale: true,
        colorbar: {
          title: { text: 'Speed (km/h)', font: { color: '#ccc', size: 11 } },
          tickfont: { color: '#ccc', size: 10 },
          len: 0.5,
          y: 0.75
        },
        symbol: 'triangle-up',
        line: { width: 1, color: '#fff' }
      },
      customdata: airplanes.map(a => [a.altitude, a.speed, a.origin?.code, a.destination?.code]),
      hovertemplate: '<b>%{text}</b><br>Route: %{customdata[2]} → %{customdata[3]}<br>Altitude: %{customdata[0]:,} ft<br>Speed: %{customdata[1]} km/h<br>Lat: %{y}° Lng: %{x}°<extra></extra>',
      name: 'Aircraft'
    });

    // Add flight path for selected airplane
    if (selectedItem?.itemType === 'airplane' && selectedItem.trajectory && selectedItem.trajectory.length >= 3) {
      // Origin to current
      traces.push({
        type: 'scatter',
        mode: 'lines',
        x: [selectedItem.trajectory[0].lng, selectedItem.trajectory[1].lng],
        y: [selectedItem.trajectory[0].lat, selectedItem.trajectory[1].lat],
        line: { color: '#00FF00', width: 3 },
        name: 'Completed',
        showlegend: false
      });
      // Current to destination
      traces.push({
        type: 'scatter',
        mode: 'lines',
        x: [selectedItem.trajectory[1].lng, selectedItem.trajectory[2].lng],
        y: [selectedItem.trajectory[1].lat, selectedItem.trajectory[2].lat],
        line: { color: '#FFD700', width: 2, dash: 'dash' },
        name: 'Remaining',
        showlegend: false
      });
      // Origin marker
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: [selectedItem.trajectory[0].lng],
        y: [selectedItem.trajectory[0].lat],
        marker: { size: 12, color: '#00FF00', symbol: 'circle' },
        name: `Origin: ${selectedItem.origin?.code}`,
        showlegend: true
      });
      // Destination marker
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: [selectedItem.trajectory[2].lng],
        y: [selectedItem.trajectory[2].lat],
        marker: { size: 12, color: '#FF4444', symbol: 'square' },
        name: `Dest: ${selectedItem.destination?.code}`,
        showlegend: true
      });
    }

    return traces;
  }, [airplanes, selectedItem]);

  const airplaneMapLayout = useMemo(() => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 20, 40, 0.9)',
    title: { text: '✈️ Global Flight Tracker', font: { color: '#FFD700', size: 16 } },
    xaxis: {
      title: { text: 'Longitude', font: { color: '#888' } },
      range: [-180, 180],
      gridcolor: 'rgba(100,100,150,0.2)',
      zerolinecolor: 'rgba(100,100,150,0.3)',
      tickfont: { color: '#888' }
    },
    yaxis: {
      title: { text: 'Latitude', font: { color: '#888' } },
      range: [-90, 90],
      gridcolor: 'rgba(100,100,150,0.2)',
      zerolinecolor: 'rgba(100,100,150,0.3)',
      tickfont: { color: '#888' },
      scaleanchor: 'x'
    },
    legend: {
      font: { color: '#ccc' },
      bgcolor: 'rgba(0,0,0,0.5)',
      x: 0.01,
      y: 0.99
    },
    font: { color: '#ccc' },
    margin: { t: 50, b: 50, l: 60, r: 30 },
    // Add map-like background shapes
    shapes: [
      // Equator line
      { type: 'line', x0: -180, x1: 180, y0: 0, y1: 0, line: { color: 'rgba(255,215,0,0.2)', width: 1, dash: 'dot' } },
      // Tropics
      { type: 'line', x0: -180, x1: 180, y0: 23.5, y1: 23.5, line: { color: 'rgba(100,100,150,0.2)', width: 1, dash: 'dot' } },
      { type: 'line', x0: -180, x1: 180, y0: -23.5, y1: -23.5, line: { color: 'rgba(100,100,150,0.2)', width: 1, dash: 'dot' } },
      // Prime meridian
      { type: 'line', x0: 0, x1: 0, y0: -90, y1: 90, line: { color: 'rgba(255,215,0,0.2)', width: 1, dash: 'dot' } }
    ]
  }), []);

  // Handle click on airplane in the map
  const handlePlotClick = useCallback((event) => {
    if (event.points && event.points[0] && event.points[0].data.name === 'Aircraft') {
      const pointIndex = event.points[0].pointIndex;
      if (airplanes[pointIndex]) {
        handleSelectItem(airplanes[pointIndex], 'airplane');
      }
    }
  }, [airplanes, handleSelectItem]);

  // 3D Satellite visualization
  const satelliteTrace = useMemo(() => {
    const filtered = bodyFilter === 'all' ? satellites : satellites.filter(s => s.body.toLowerCase() === bodyFilter);
    return {
      type: 'scatter3d',
      mode: 'markers+text',
      x: filtered.map(s => parseFloat(s.lng)),
      y: filtered.map(s => parseFloat(s.lat)),
      z: filtered.map(s => s.altitude),
      text: filtered.map(s => s.name),
      textposition: 'top center',
      marker: {
        size: 8,
        color: filtered.map(s => {
          switch(s.body) {
            case 'Earth': return '#4ECDC4';
            case 'Moon': return '#C0C0C0';
            case 'Mars': return '#FF6B6B';
            default: return '#9370DB';
          }
        }),
        symbol: 'diamond'
      },
      hovertemplate: '%{text}<br>Alt: %{z} km<br>Lat: %{y}°<br>Lng: %{x}°<extra></extra>'
    };
  }, [satellites, bodyFilter]);

  // Trajectory traces for selected satellite
  const trajectoryTrace = useMemo(() => {
    if (!selectedItem) return null;
    
    if (selectedItem.itemType === 'satellite' && selectedItem.trajectory) {
      return {
        type: 'scatter3d',
        mode: 'lines',
        x: selectedItem.trajectory.map(p => p.x / 100),
        y: selectedItem.trajectory.map(p => p.y / 100),
        z: selectedItem.trajectory.map(p => p.z / 100),
        line: { color: '#00d4ff', width: 3 },
        name: 'Orbit Path'
      };
    }
    
    // Airplane trajectory is rendered in the custom world map
    return null;
  }, [selectedItem]);

  const satellite3DLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    title: { text: 'Satellite Positions', font: { color: '#00d4ff', size: 16 } },
    scene: {
      xaxis: { title: 'Longitude', color: '#666', gridcolor: '#333' },
      yaxis: { title: 'Latitude', color: '#666', gridcolor: '#333' },
      zaxis: { title: 'Altitude (km)', color: '#666', gridcolor: '#333' },
      bgcolor: 'rgba(10, 10, 30, 0.8)'
    },
    font: { color: '#ccc' },
    margin: { t: 50, b: 50, l: 50, r: 50 }
  };

  return (
    <PageContainer>
      <Header>🛰️ Live Tracking Dashboard</Header>
      <Description>
        Track satellites orbiting Earth, Moon, and Mars, as well as aircraft currently in the atmosphere.
        View real-time positions, altitudes, speeds, and trajectories. Select any object to see detailed
        information including its path, origin, and destination.
        {isLoading && ' Loading...'}
      </Description>

      <div style={{ textAlign: 'center' }}>
        <DataSourceBadge isLive={dataSource === 'live'}>
          <span className="dot"></span>
          {dataSource === 'live' ? 'Live Data (N2YO / OpenSky)' : 'Simulated Data'}
          {dataSource === 'simulated' && ' - Configure API keys for live tracking'}
        </DataSourceBadge>
      </div>

      <TabContainer>
        <Tab active={activeTab === 'satellites'} onClick={() => setActiveTab('satellites')}>
          🛰️ Satellites
        </Tab>
        <Tab active={activeTab === 'airplanes'} onClick={() => setActiveTab('airplanes')}>
          ✈️ Airplanes
        </Tab>
      </TabContainer>

      {/* Metrics Row */}
      <DashboardGrid>
        {activeTab === 'satellites' ? (
          <>
            <MetricCard gradient="rgba(0,212,255,0.2), rgba(0,100,255,0.05)" valueColor="#00d4ff">
              <div className="icon">🛰️</div>
              <div className="value">{stats.totalSatellites}</div>
              <div className="label">Total Satellites Tracked</div>
            </MetricCard>
            <MetricCard gradient="rgba(78,205,196,0.2), rgba(68,160,141,0.05)" valueColor="#4ECDC4">
              <div className="icon">🌍</div>
              <div className="value">{stats.earthSatellites}</div>
              <div className="label">Earth Orbiters</div>
            </MetricCard>
            <MetricCard gradient="rgba(192,192,192,0.2), rgba(150,150,150,0.05)" valueColor="#C0C0C0">
              <div className="icon">🌙</div>
              <div className="value">{stats.moonSatellites}</div>
              <div className="label">Moon Orbiters</div>
            </MetricCard>
            <MetricCard gradient="rgba(255,107,107,0.2), rgba(255,50,50,0.05)" valueColor="#FF6B6B">
              <div className="icon">🔴</div>
              <div className="value">{stats.marsSatellites}</div>
              <div className="label">Mars Orbiters</div>
            </MetricCard>
          </>
        ) : (
          <>
            <MetricCard gradient="rgba(255,215,0,0.2), rgba(200,150,0,0.05)" valueColor="#FFD700">
              <div className="icon">✈️</div>
              <div className="value">{stats.totalAirplanes}</div>
              <div className="label">Active Flights</div>
            </MetricCard>
            <MetricCard gradient="rgba(0,212,255,0.2), rgba(0,100,255,0.05)" valueColor="#00d4ff">
              <div className="icon">📏</div>
              <div className="value">{stats.avgAltitude}</div>
              <div className="label">Avg Altitude (ft)</div>
            </MetricCard>
            <MetricCard gradient="rgba(78,205,196,0.2), rgba(68,160,141,0.05)" valueColor="#4ECDC4">
              <div className="icon">💨</div>
              <div className="value">{stats.avgSpeed}</div>
              <div className="label">Avg Speed (km/h)</div>
            </MetricCard>
            <MetricCard gradient="rgba(147,112,219,0.2), rgba(100,80,180,0.05)" valueColor="#9370DB">
              <div className="icon">🕐</div>
              <div className="value">{lastUpdate.toLocaleTimeString()}</div>
              <div className="label">Last Updated</div>
            </MetricCard>
          </>
        )}
      </DashboardGrid>

      {activeTab === 'satellites' && (
        <FilterBar>
          <FilterButton active={bodyFilter === 'all'} onClick={() => setBodyFilter('all')}>
            All Bodies
          </FilterButton>
          <FilterButton active={bodyFilter === 'earth'} onClick={() => setBodyFilter('earth')}>
            🌍 Earth
          </FilterButton>
          <FilterButton active={bodyFilter === 'moon'} onClick={() => setBodyFilter('moon')}>
            🌙 Moon
          </FilterButton>
          <FilterButton active={bodyFilter === 'mars'} onClick={() => setBodyFilter('mars')}>
            🔴 Mars
          </FilterButton>
        </FilterBar>
      )}

      <DashboardGrid>
        {/* Data Table */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardTitle color={activeTab === 'satellites' ? '#00d4ff' : '#FFD700'}>
            {activeTab === 'satellites' ? '🛰️ Satellite List' : '✈️ Active Flights'}
          </CardTitle>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table>
              <thead>
                {activeTab === 'satellites' ? (
                  <tr>
                    <th>Name</th>
                    <th>Body</th>
                    <th>Altitude</th>
                    <th>Speed</th>
                    <th>Type</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Altitude</th>
                    <th>Speed</th>
                    <th>Progress</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'satellites' 
                  ? filteredSatellites.map((sat, i) => (
                      <tr 
                        key={i} 
                        onClick={() => handleSelectItem(sat, 'satellite')}
                        className={selectedItem?.name === sat.name ? 'selected' : ''}
                      >
                        <td>{sat.name}</td>
                        <td><Badge type={sat.body.toLowerCase()}>{sat.body}</Badge></td>
                        <td>{sat.altitude.toLocaleString()} km</td>
                        <td>{sat.speed} km/s</td>
                        <td>{sat.type}</td>
                      </tr>
                    ))
                  : airplanes.map((plane, i) => (
                      <tr 
                        key={i}
                        onClick={() => handleSelectItem(plane, 'airplane')}
                        className={selectedItem?.callsign === plane.callsign ? 'selected' : ''}
                      >
                        <td>{plane.callsign}</td>
                        <td>{plane.origin.code} → {plane.destination.code}</td>
                        <td>{plane.altitude.toLocaleString()} ft</td>
                        <td>{plane.speed} km/h</td>
                        <td>{plane.progress}%</td>
                      </tr>
                    ))
                }
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Visualization */}
        <Card style={{ gridColumn: 'span 1' }}>
          {activeTab === 'satellites' ? (
            <Plot
              data={trajectoryTrace ? [satelliteTrace, trajectoryTrace] : [satelliteTrace]}
              layout={satellite3DLayout}
              style={{ width: '100%', height: '450px' }}
              config={{ responsive: true, displayModeBar: true }}
            />
          ) : (
            <Plot
              data={airplaneMapData}
              layout={airplaneMapLayout}
              style={{ width: '100%', height: '450px' }}
              config={{ responsive: true, displayModeBar: true }}
              onClick={handlePlotClick}
            />
          )}
        </Card>
      </DashboardGrid>

      {/* Detail Panel */}
      {selectedItem && (
        <PlotContainer>
          <DetailPanel>
            <DetailHeader>
              <h3>
                {selectedItem.itemType === 'satellite' ? '🛰️' : '✈️'}
                {selectedItem.name || selectedItem.callsign} - Detailed Information
              </h3>
              <button onClick={() => setSelectedItem(null)}>✕ Close</button>
            </DetailHeader>

            {selectedItem.itemType === 'satellite' ? (
              <>
              <DetailGrid>
                <DetailItem color="#00d4ff">
                  <div className="label">NORAD ID</div>
                  <div className="value">{selectedItem.noradId}</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">Celestial Body</div>
                  <div className="value">{selectedItem.body}</div>
                </DetailItem>
                <DetailItem color="#9370DB">
                  <div className="label">Orbit Type</div>
                  <div className="value">{selectedItem.orbit}</div>
                </DetailItem>
                <DetailItem color="#FFD700">
                  <div className="label">Altitude</div>
                  <div className="value">{selectedItem.altitude.toLocaleString()} km</div>
                </DetailItem>
                <DetailItem color="#00d4ff">
                  <div className="label">Velocity</div>
                  <div className="value">{selectedItem.speed} km/s</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">Inclination</div>
                  <div className="value">{selectedItem.inclination}°</div>
                </DetailItem>
                <DetailItem color="#9370DB">
                  <div className="label">Orbital Period</div>
                  <div className="value">{selectedItem.period} min</div>
                </DetailItem>
                <DetailItem color="#FFD700">
                  <div className="label">Type</div>
                  <div className="value">{selectedItem.type}</div>
                </DetailItem>
                <DetailItem color="#00d4ff">
                  <div className="label">Country/Org</div>
                  <div className="value">{selectedItem.country}</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">Launch Date</div>
                  <div className="value">{selectedItem.launchDate}</div>
                </DetailItem>
                <DetailItem color={selectedItem.status === 'Active' ? '#4ECDC4' : '#FF6B6B'}>
                  <div className="label">Status</div>
                  <div className="value">{selectedItem.status}</div>
                </DetailItem>
                <DetailItem color="#9370DB">
                  <div className="label">Current Position</div>
                  <div className="value">Lat: {selectedItem.lat}° Lng: {selectedItem.lng}°</div>
                </DetailItem>
              </DetailGrid>
              
              {/* Visual Passes Section - Only shown when live data is available */}
              {selectedItemPasses && selectedItemPasses.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <CardTitle color="#FFD700">🔭 Upcoming Visual Passes</CardTitle>
                  <Table>
                    <thead>
                      <tr>
                        <th>Start Time (UTC)</th>
                        <th>Direction</th>
                        <th>Max Elevation</th>
                        <th>Duration</th>
                        <th>Magnitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItemPasses.slice(0, 5).map((pass, idx) => (
                        <tr key={idx}>
                          <td>{new Date(pass.startUTC * 1000).toLocaleString()}</td>
                          <td>{pass.startAzCompass} → {pass.endAzCompass}</td>
                          <td>{pass.maxEl}°</td>
                          <td>{pass.duration}s</td>
                          <td>{pass.mag < 100000 ? pass.mag.toFixed(1) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              
              {/* Real-time Positions Section - Only shown when live data is available */}
              {selectedItemPositions && selectedItemPositions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <CardTitle color="#4ECDC4">📍 Position Prediction (Next 60 seconds)</CardTitle>
                  <DetailGrid>
                    <DetailItem color="#00d4ff">
                      <div className="label">Current Latitude</div>
                      <div className="value">{selectedItemPositions[0].satlatitude?.toFixed(4)}°</div>
                    </DetailItem>
                    <DetailItem color="#4ECDC4">
                      <div className="label">Current Longitude</div>
                      <div className="value">{selectedItemPositions[0].satlongitude?.toFixed(4)}°</div>
                    </DetailItem>
                    <DetailItem color="#9370DB">
                      <div className="label">Current Altitude</div>
                      <div className="value">{selectedItemPositions[0].sataltitude?.toFixed(2)} km</div>
                    </DetailItem>
                    <DetailItem color="#FFD700">
                      <div className="label">Azimuth (from observer)</div>
                      <div className="value">{selectedItemPositions[0].azimuth?.toFixed(2)}°</div>
                    </DetailItem>
                    <DetailItem color="#00d4ff">
                      <div className="label">Elevation (from observer)</div>
                      <div className="value">{selectedItemPositions[0].elevation?.toFixed(2)}°</div>
                    </DetailItem>
                    <DetailItem color="#4ECDC4">
                      <div className="label">Right Ascension</div>
                      <div className="value">{selectedItemPositions[0].ra?.toFixed(4)}°</div>
                    </DetailItem>
                  </DetailGrid>
                </div>
              )}
              </>
            ) : (
              <DetailGrid>
                <DetailItem color="#FFD700">
                  <div className="label">Callsign</div>
                  <div className="value">{selectedItem.callsign}</div>
                </DetailItem>
                <DetailItem color="#00d4ff">
                  <div className="label">Airline</div>
                  <div className="value">{selectedItem.airline}</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">Aircraft</div>
                  <div className="value">{selectedItem.aircraft}</div>
                </DetailItem>
                <DetailItem color="#9370DB">
                  <div className="label">Origin</div>
                  <div className="value">{selectedItem.origin.code} - {selectedItem.origin.city}</div>
                </DetailItem>
                <DetailItem color="#FF6B6B">
                  <div className="label">Destination</div>
                  <div className="value">{selectedItem.destination.code} - {selectedItem.destination.city}</div>
                </DetailItem>
                <DetailItem color="#FFD700">
                  <div className="label">Altitude</div>
                  <div className="value">{selectedItem.altitude.toLocaleString()} ft</div>
                </DetailItem>
                <DetailItem color="#00d4ff">
                  <div className="label">Ground Speed</div>
                  <div className="value">{selectedItem.speed} km/h</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">Heading</div>
                  <div className="value">{selectedItem.heading}°</div>
                </DetailItem>
                <DetailItem color="#9370DB">
                  <div className="label">Progress</div>
                  <div className="value">{selectedItem.progress}%</div>
                </DetailItem>
                <DetailItem color="#FFD700">
                  <div className="label">Departure Time</div>
                  <div className="value">{selectedItem.departureTime ? new Date(selectedItem.departureTime).toLocaleTimeString() : 'N/A'}</div>
                </DetailItem>
                <DetailItem color="#4ECDC4">
                  <div className="label">ETA</div>
                  <div className="value">{selectedItem.eta ? new Date(selectedItem.eta).toLocaleTimeString() : 'N/A'}</div>
                </DetailItem>
                <DetailItem color={selectedItem.status === 'In Flight' ? '#4ECDC4' : '#FF6B6B'}>
                  <div className="label">Status</div>
                  <div className="value">{selectedItem.status}</div>
                </DetailItem>
              </DetailGrid>
            )}
          </DetailPanel>
        </PlotContainer>
      )}

      {/* Research Link */}
      <ResearchLink>
        <h4>📚 Connect to Research</h4>
        <p>
          Understanding orbital mechanics is crucial for both satellite tracking and Near-Earth Object (NEO) research.
          The same principles governing satellite orbits apply to asteroids and comets approaching Earth.
          Explore our research findings to learn more about orbital dynamics, approach velocities, and celestial mechanics.
        </p>
        <a href="#/research">View Research Findings →</a>
      </ResearchLink>
    </PageContainer>
  );
};

export default LiveTracking;
