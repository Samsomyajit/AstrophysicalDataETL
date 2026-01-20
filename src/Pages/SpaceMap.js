import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

const PageContainer = styled.div`
  background: linear-gradient(135deg, #0a0a20 0%, #1a1a40 50%, #0a0a20 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
`;

const Header = styled.h2`
  text-align: center;
  color: #ff6b6b;
  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  margin-bottom: 30px;
`;

const Description = styled.p`
  text-align: center;
  color: #aaa;
  max-width: 900px;
  margin: 0 auto 30px;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
`;

const TabButton = styled.button`
  padding: 12px 25px;
  background: ${props => props.active ? 'linear-gradient(45deg, #ff6b6b, #ff8e53)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: ${props => props.active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
`;

const PlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 30px auto;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(255,107,107,0.2), rgba(255,107,107,0.05)'});
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  h3 {
    color: #aaa;
    font-size: 0.9rem;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .value {
    font-size: 2.5rem;
    font-weight: bold;
    color: ${props => props.valueColor || '#ff6b6b'};
    margin: 0;
  }

  .unit {
    color: #888;
    font-size: 0.9rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  color: #ff6b6b;
  font-weight: bold;
`;

const RangeSlider = styled.input`
  width: 150px;
  accent-color: #ff6b6b;
`;

const DetailPanel = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  padding: 25px;
  margin-top: 20px;
  border: 1px solid rgba(147, 112, 219, 0.4);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    color: #9370DB;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

// Notable stars data with right ascension (RA), declination (Dec), distance, and properties
const NOTABLE_STARS = [
  { name: 'Sirius', constellation: 'Canis Major', ra: 101.287, dec: -16.716, distance: 8.6, magnitude: -1.46, spectralType: 'A1V', color: '#A3C5FF' },
  { name: 'Canopus', constellation: 'Carina', ra: 95.987, dec: -52.695, distance: 310, magnitude: -0.72, spectralType: 'A9II', color: '#FFF4E8' },
  { name: 'Alpha Centauri', constellation: 'Centaurus', ra: 219.902, dec: -60.834, distance: 4.37, magnitude: -0.27, spectralType: 'G2V', color: '#FFF5E0' },
  { name: 'Arcturus', constellation: 'Boötes', ra: 213.915, dec: 19.182, distance: 37, magnitude: -0.05, spectralType: 'K1.5III', color: '#FFB347' },
  { name: 'Vega', constellation: 'Lyra', ra: 279.234, dec: 38.783, distance: 25, magnitude: 0.03, spectralType: 'A0V', color: '#CAD7FF' },
  { name: 'Capella', constellation: 'Auriga', ra: 79.172, dec: 45.997, distance: 42.9, magnitude: 0.08, spectralType: 'G5III', color: '#FFE5B4' },
  { name: 'Rigel', constellation: 'Orion', ra: 78.634, dec: -8.201, distance: 860, magnitude: 0.13, spectralType: 'B8Ia', color: '#B5D4FF' },
  { name: 'Procyon', constellation: 'Canis Minor', ra: 114.825, dec: 5.224, distance: 11.5, magnitude: 0.34, spectralType: 'F5IV', color: '#FFEFD5' },
  { name: 'Betelgeuse', constellation: 'Orion', ra: 88.792, dec: 7.407, distance: 700, magnitude: 0.42, spectralType: 'M1Ia', color: '#FF6B4A' },
  { name: 'Altair', constellation: 'Aquila', ra: 297.695, dec: 8.868, distance: 17, magnitude: 0.77, spectralType: 'A7V', color: '#CAD7FF' },
  { name: 'Aldebaran', constellation: 'Taurus', ra: 68.980, dec: 16.509, distance: 65, magnitude: 0.85, spectralType: 'K5III', color: '#FF8C4B' },
  { name: 'Antares', constellation: 'Scorpius', ra: 247.351, dec: -26.432, distance: 550, magnitude: 1.06, spectralType: 'M1.5Iab', color: '#FF4500' },
  { name: 'Spica', constellation: 'Virgo', ra: 201.298, dec: -11.161, distance: 250, magnitude: 1.04, spectralType: 'B1V', color: '#B0C4FF' },
  { name: 'Pollux', constellation: 'Gemini', ra: 116.329, dec: 28.026, distance: 34, magnitude: 1.14, spectralType: 'K0III', color: '#FFD580' },
  { name: 'Fomalhaut', constellation: 'Piscis Austrinus', ra: 344.412, dec: -29.622, distance: 25, magnitude: 1.16, spectralType: 'A3V', color: '#CAD8FF' },
  { name: 'Deneb', constellation: 'Cygnus', ra: 310.357, dec: 45.280, distance: 2615, magnitude: 1.25, spectralType: 'A2Ia', color: '#CAD7FF' },
  { name: 'Regulus', constellation: 'Leo', ra: 152.092, dec: 11.967, distance: 79, magnitude: 1.35, spectralType: 'B8IVn', color: '#B5D4FF' },
  { name: 'Polaris', constellation: 'Ursa Minor', ra: 37.954, dec: 89.264, distance: 433, magnitude: 1.98, spectralType: 'F7Ib', color: '#FFF8DC' },
  { name: 'Castor', constellation: 'Gemini', ra: 113.649, dec: 31.888, distance: 51, magnitude: 1.58, spectralType: 'A1V', color: '#CAD7FF' },
  { name: 'Bellatrix', constellation: 'Orion', ra: 81.282, dec: 6.349, distance: 250, magnitude: 1.64, spectralType: 'B2III', color: '#B0C4FF' }
];

// Visualization constants
const CONSTELLATION_LINE_DISTANCE = 100; // Light-years for constellation line rendering

// Constellation line data (simplified connections between major stars)
const CONSTELLATION_LINES = [
  // Orion
  { constellation: 'Orion', stars: ['Betelgeuse', 'Bellatrix'], color: '#4488FF' },
  { constellation: 'Orion', stars: ['Rigel', 'Bellatrix'], color: '#4488FF' },
  // Ursa Major (simplified Big Dipper)
  { constellation: 'Ursa Major', points: [[165, 57], [178, 54], [191, 55], [206, 49], [193, 62], [178, 54]], color: '#44FF88' },
  // Cassiopeia
  { constellation: 'Cassiopeia', points: [[1, 59], [10, 56], [14, 60], [21, 56], [28, 63]], color: '#FF88AA' },
  // Leo
  { constellation: 'Leo', points: [[152, 12], [147, 14], [150, 20], [168, 20], [177, 12], [152, 12]], color: '#FFAA44' },
  // Cygnus (Northern Cross)
  { constellation: 'Cygnus', points: [[310, 45], [305, 40], [290, 28], [292, 33], [311, 30], [305, 40]], color: '#AA88FF' }
];

const SpaceMap = () => {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('2d');
  const [distanceRange, setDistanceRange] = useState(100);
  const [sizeFilter, setSizeFilter] = useState(0);
  const [selectedStar, setSelectedStar] = useState(null);
  const [starDistanceFilter, setStarDistanceFilter] = useState(1000);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_enhanced.json`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching enhanced data:', error);
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_cleaned.json`);
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
  };

  // Convert RA/Dec to 3D Cartesian coordinates for star map
  const raDecToCartesian = useCallback((ra, dec, distance) => {
    const raRad = (ra * Math.PI) / 180;
    const decRad = (dec * Math.PI) / 180;
    // Use logarithmic scale for distance to show nearby and far stars together
    const logDistance = Math.log10(distance + 1) * 20;
    return {
      x: logDistance * Math.cos(decRad) * Math.cos(raRad),
      y: logDistance * Math.cos(decRad) * Math.sin(raRad),
      z: logDistance * Math.sin(decRad)
    };
  }, []);

  // Filter stars by distance
  const filteredStars = useMemo(() => {
    return NOTABLE_STARS.filter(star => star.distance <= starDistanceFilter);
  }, [starDistanceFilter]);

  // 3D Star Map data
  const starMapData = useMemo(() => {
    const traces = [];
    
    // Add Earth at center
    traces.push({
      type: 'scatter3d',
      mode: 'markers',
      x: [0],
      y: [0],
      z: [0],
      marker: { size: 12, color: '#4169E1', symbol: 'circle' },
      name: '🌍 Earth (You are here)',
      hovertemplate: '🌍 Earth<br>Your observation point<extra></extra>'
    });
    
    // Add stars
    const starPositions = filteredStars.map(star => ({
      ...star,
      ...raDecToCartesian(star.ra, star.dec, star.distance)
    }));
    
    traces.push({
      type: 'scatter3d',
      mode: 'markers+text',
      x: starPositions.map(s => s.x),
      y: starPositions.map(s => s.y),
      z: starPositions.map(s => s.z),
      text: starPositions.map(s => s.name),
      textposition: 'top center',
      textfont: { size: 9, color: '#fff' },
      marker: {
        size: starPositions.map(s => Math.max(6, 12 - s.magnitude * 2)),
        color: starPositions.map(s => s.color),
        opacity: 0.9,
        line: { width: 1, color: 'white' }
      },
      customdata: starPositions.map(s => [s.constellation, s.distance, s.magnitude, s.spectralType]),
      hovertemplate: '<b>⭐ %{text}</b><br>Constellation: %{customdata[0]}<br>Distance: %{customdata[1]} light-years<br>Magnitude: %{customdata[2]}<br>Spectral Type: %{customdata[3]}<extra></extra>',
      name: 'Stars'
    });
    
    // Add constellation lines
    CONSTELLATION_LINES.forEach(line => {
      if (line.stars) {
        // Connect named stars
        const lineStars = line.stars.map(name => 
          NOTABLE_STARS.find(s => s.name === name)
        ).filter(Boolean);
        
        if (lineStars.length >= 2) {
          const positions = lineStars.map(s => raDecToCartesian(s.ra, s.dec, s.distance));
          traces.push({
            type: 'scatter3d',
            mode: 'lines',
            x: positions.map(p => p.x),
            y: positions.map(p => p.y),
            z: positions.map(p => p.z),
            line: { color: line.color, width: 2 },
            name: line.constellation,
            showlegend: false,
            hoverinfo: 'skip'
          });
        }
      } else if (line.points) {
        // Use direct RA/Dec points with constant distance for visualization
        const positions = line.points.map(([ra, dec]) => raDecToCartesian(ra, dec, CONSTELLATION_LINE_DISTANCE));
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: positions.map(p => p.x),
          y: positions.map(p => p.y),
          z: positions.map(p => p.z),
          line: { color: line.color, width: 2, dash: 'dot' },
          name: line.constellation,
          showlegend: false,
          hoverinfo: 'skip'
        });
      }
    });
    
    return traces;
  }, [filteredStars, raDecToCartesian]);

  const starMapLayout = useMemo(() => ({
    title: {
      text: '🌌 Interstellar Star Map - View from Earth',
      font: { color: '#9370DB', size: 20 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      xaxis: { title: '', showticklabels: false, showgrid: false, zeroline: false, visible: false },
      yaxis: { title: '', showticklabels: false, showgrid: false, zeroline: false, visible: false },
      zaxis: { title: '', showticklabels: false, showgrid: false, zeroline: false, visible: false },
      bgcolor: 'rgba(0, 0, 15, 1)',
      aspectmode: 'cube',
      camera: {
        eye: { x: 2.2, y: 2.2, z: 1.5 }
      }
    },
    legend: {
      font: { color: '#ccc', size: 12 },
      bgcolor: 'rgba(0,0,0,0.6)',
      x: 0.01,
      y: 0.99
    },
    font: { color: '#ccc' },
    margin: { t: 60, b: 30, l: 30, r: 30 }
  }), []);

  // Handle star selection from plot click
  const handleStarClick = useCallback((event) => {
    if (event.points && event.points[0]) {
      const point = event.points[0];
      if (point.data.name === 'Stars') {
        const starName = point.text;
        const star = NOTABLE_STARS.find(s => s.name === starName);
        if (star) {
          setSelectedStar(star);
        }
      }
    }
  }, []);

  // Filter data
  const filteredData = data.filter(d => 
    (d.distance / 1e6) <= distanceRange &&
    d.diameter >= sizeFilter
  );

  // Calculate stats
  const hazardousCount = filteredData.filter(d => d.is_potentially_hazardous).length;
  const avgDistance = filteredData.length > 0 
    ? filteredData.reduce((sum, d) => sum + (d.distance || 0), 0) / filteredData.length 
    : 0;
  const avgDiameter = filteredData.length > 0 
    ? filteredData.reduce((sum, d) => sum + (d.diameter || 0), 0) / filteredData.length 
    : 0;
  const closestApproach = filteredData.length > 0 
    ? Math.min(...filteredData.map(d => d.distance || Infinity)) 
    : 0;

  // Generate positions based on distance and random angles (for visualization)
  const generatePositions = () => {
    return filteredData.map((neo, index) => {
      // Use mean anomaly for angle, or generate based on index
      const angle = (neo.mean_anomaly || (index * 137.5)) * Math.PI / 180;
      const distance = neo.distance / 1e6; // Convert to millions of km
      const inclination = (neo.inclination || 0) * Math.PI / 180;
      
      return {
        x: distance * Math.cos(angle) * Math.cos(inclination),
        y: distance * Math.sin(angle) * Math.cos(inclination),
        z: distance * Math.sin(inclination),
        ...neo
      };
    });
  };

  const positions = generatePositions();

  // Size mapping for visualization
  const getSizeScale = (diameter) => {
    return Math.max(5, Math.min(30, diameter * 10 + 5));
  };

  const getColor = (neo) => {
    if (neo.is_potentially_hazardous) return '#FF4444';
    if (neo.diameter > 0.5) return '#FFD700';
    if (neo.diameter > 0.1) return '#00CED1';
    return '#90EE90';
  };

  // 2D Polar View
  const polar2DTrace = {
    type: 'scatterpolar',
    mode: 'markers',
    r: filteredData.map(d => d.distance / 1e6),
    theta: filteredData.map((d, i) => d.mean_anomaly || (i * 137.5) % 360),
    text: filteredData.map(d => 
      `<b>${d.name}</b><br>` +
      `Distance: ${(d.distance / 1e6).toFixed(2)} million km<br>` +
      `Diameter: ${d.diameter?.toFixed(3)} km<br>` +
      `Velocity: ${d.relative_velocity?.toFixed(1)} km/s<br>` +
      `${d.is_potentially_hazardous ? '⚠️ Potentially Hazardous' : '✅ Safe'}`
    ),
    hoverinfo: 'text',
    marker: {
      size: filteredData.map(d => getSizeScale(d.diameter)),
      color: filteredData.map(d => getColor(d)),
      opacity: 0.8,
      line: { color: 'white', width: 1 }
    },
    name: 'NEOs'
  };

  const polarLayout = {
    title: {
      text: 'Near-Earth Objects - Polar View',
      font: { color: '#ff6b6b', size: 18 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    polar: {
      bgcolor: 'rgba(10, 10, 40, 0.8)',
      radialaxis: {
        visible: true,
        range: [0, distanceRange],
        color: '#666',
        gridcolor: '#333',
        title: { text: 'Distance (million km)', font: { color: '#aaa' } }
      },
      angularaxis: {
        color: '#666',
        gridcolor: '#333'
      }
    },
    showlegend: false,
    font: { color: '#ccc' }
  };

  // 3D Scatter View
  const scatter3DTrace = {
    type: 'scatter3d',
    mode: 'markers',
    x: positions.map(p => p.x),
    y: positions.map(p => p.y),
    z: positions.map(p => p.z),
    text: positions.map(p => 
      `<b>${p.name}</b><br>` +
      `Distance: ${(p.distance / 1e6).toFixed(2)} million km<br>` +
      `Diameter: ${p.diameter?.toFixed(3)} km<br>` +
      `${p.is_potentially_hazardous ? '⚠️ Potentially Hazardous' : '✅ Safe'}`
    ),
    hoverinfo: 'text',
    marker: {
      size: positions.map(p => getSizeScale(p.diameter) * 0.7),
      color: positions.map(p => p.distance),
      colorscale: 'Viridis',
      opacity: 0.9,
      colorbar: {
        title: { text: 'Distance (km)', font: { color: '#ccc' } },
        tickfont: { color: '#ccc' }
      }
    }
  };

  // Earth at center
  const earthTrace = {
    type: 'scatter3d',
    mode: 'markers',
    x: [0],
    y: [0],
    z: [0],
    marker: { size: 15, color: '#4169E1' },
    name: 'Earth',
    hovertemplate: 'Earth<extra></extra>'
  };

  const scatter3DLayout = {
    title: {
      text: '3D Space Map - NEO Distribution',
      font: { color: '#ff6b6b', size: 18 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      xaxis: { title: 'X (million km)', color: '#666', gridcolor: '#222' },
      yaxis: { title: 'Y (million km)', color: '#666', gridcolor: '#222' },
      zaxis: { title: 'Z (million km)', color: '#666', gridcolor: '#222' },
      bgcolor: 'rgba(5, 5, 20, 0.9)',
      aspectmode: 'cube'
    },
    showlegend: false,
    font: { color: '#ccc' }
  };

  // Distance histogram
  const distanceHistTrace = {
    type: 'histogram',
    x: filteredData.map(d => d.distance / 1e6),
    nbinsx: 20,
    marker: {
      color: 'rgba(255, 107, 107, 0.7)',
      line: { color: '#ff6b6b', width: 1 }
    },
    name: 'Distance Distribution'
  };

  const histLayout = {
    title: {
      text: 'Distance Distribution',
      font: { color: '#ff6b6b', size: 16 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    xaxis: { title: 'Distance (million km)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Count', color: '#666', gridcolor: '#333' },
    font: { color: '#ccc' },
    bargap: 0.1
  };

  // Size vs Distance scatter
  const sizeDistanceTrace = {
    type: 'scatter',
    mode: 'markers',
    x: filteredData.map(d => d.distance / 1e6),
    y: filteredData.map(d => d.diameter),
    text: filteredData.map(d => d.name),
    hovertemplate: '%{text}<br>Distance: %{x:.2f} million km<br>Diameter: %{y:.3f} km<extra></extra>',
    marker: {
      size: filteredData.map(d => Math.max(8, d.diameter * 15)),
      color: filteredData.map(d => d.relative_velocity || 20),
      colorscale: 'Plasma',
      showscale: true,
      colorbar: {
        title: { text: 'Velocity (km/s)', font: { color: '#ccc' } },
        tickfont: { color: '#ccc' }
      }
    }
  };

  const sizeDistanceLayout = {
    title: {
      text: 'Size vs Distance (colored by velocity)',
      font: { color: '#ff6b6b', size: 16 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    xaxis: { title: 'Distance (million km)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Diameter (km)', color: '#666', gridcolor: '#333', type: 'log' },
    font: { color: '#ccc' }
  };

  return (
    <PageContainer>
      <Header>🗺️ Space Map</Header>
      <Description>
        Explore the spatial distribution of Near-Earth Objects around our planet 
        and navigate the interstellar star map visible from Earth. 
        Switch between polar, 3D, star map, and analysis views. 
        Click on any star to see detailed information.
      </Description>

      <StatsGrid>
        <StatCard gradient="rgba(255,107,107,0.2), rgba(255,107,107,0.05)" valueColor="#ff6b6b">
          <h3>Total NEOs Displayed</h3>
          <p className="value">{filteredData.length}</p>
          <span className="unit">objects</span>
        </StatCard>
        <StatCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)" valueColor="#FFD700">
          <h3>Potentially Hazardous</h3>
          <p className="value">{hazardousCount}</p>
          <span className="unit">objects</span>
        </StatCard>
        <StatCard gradient="rgba(0,206,209,0.2), rgba(0,206,209,0.05)" valueColor="#00CED1">
          <h3>Average Distance</h3>
          <p className="value">{(avgDistance / 1e6).toFixed(1)}</p>
          <span className="unit">million km</span>
        </StatCard>
        <StatCard gradient="rgba(144,238,144,0.2), rgba(144,238,144,0.05)" valueColor="#90EE90">
          <h3>Closest Approach</h3>
          <p className="value">{(closestApproach / 1e6).toFixed(2)}</p>
          <span className="unit">million km</span>
        </StatCard>
        <StatCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)" valueColor="#9370DB">
          <h3>{viewMode === 'starmap' ? 'Stars Visible' : 'Average Diameter'}</h3>
          <p className="value">{viewMode === 'starmap' ? filteredStars.length : avgDiameter.toFixed(2)}</p>
          <span className="unit">{viewMode === 'starmap' ? 'stars' : 'km'}</span>
        </StatCard>
      </StatsGrid>

      <ControlPanel>
        <TabButton active={viewMode === '2d'} onClick={() => { setViewMode('2d'); setSelectedStar(null); }}>
          📍 2D Polar View
        </TabButton>
        <TabButton active={viewMode === '3d'} onClick={() => { setViewMode('3d'); setSelectedStar(null); }}>
          🌐 3D NEO View
        </TabButton>
        <TabButton active={viewMode === 'starmap'} onClick={() => setViewMode('starmap')}>
          ⭐ Star Map
        </TabButton>
        <TabButton active={viewMode === 'analysis'} onClick={() => { setViewMode('analysis'); setSelectedStar(null); }}>
          📊 Analysis View
        </TabButton>

        {viewMode !== 'starmap' ? (
          <>
            <FilterGroup>
              <Label>Max Distance: {distanceRange}M km</Label>
              <RangeSlider
                type="range"
                min="10"
                max="100"
                value={distanceRange}
                onChange={(e) => setDistanceRange(Number(e.target.value))}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Min Size: {sizeFilter.toFixed(2)} km</Label>
              <RangeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(Number(e.target.value))}
              />
            </FilterGroup>
          </>
        ) : (
          <FilterGroup>
            <Label>Max Star Distance: {starDistanceFilter} ly</Label>
            <RangeSlider
              type="range"
              min="10"
              max="3000"
              step="10"
              value={starDistanceFilter}
              onChange={(e) => setStarDistanceFilter(Number(e.target.value))}
            />
          </FilterGroup>
        )}
      </ControlPanel>

      <PlotContainer>
        {viewMode === '2d' && (
          <Plot
            data={[polar2DTrace]}
            layout={polarLayout}
            style={{ width: '100%', maxWidth: '900px', height: '700px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        )}

        {viewMode === '3d' && (
          <Plot
            data={[scatter3DTrace, earthTrace]}
            layout={scatter3DLayout}
            style={{ width: '100%', maxWidth: '1000px', height: '700px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        )}

        {viewMode === 'starmap' && (
          <>
            <Plot
              data={starMapData}
              layout={starMapLayout}
              style={{ width: '100%', maxWidth: '1400px', height: '850px' }}
              config={{ responsive: true, displayModeBar: true }}
              onClick={handleStarClick}
            />
            
            {/* Star Selection Details Panel */}
            {selectedStar && (
              <DetailPanel>
                <DetailHeader>
                  <h3>⭐ {selectedStar.name} - Star Details</h3>
                  <button onClick={() => setSelectedStar(null)}>✕ Close</button>
                </DetailHeader>
                <DetailGrid>
                  <DetailItem color="#9370DB">
                    <div className="label">Constellation</div>
                    <div className="value">{selectedStar.constellation}</div>
                  </DetailItem>
                  <DetailItem color="#FFD700">
                    <div className="label">Distance from Earth</div>
                    <div className="value">{selectedStar.distance} light-years</div>
                  </DetailItem>
                  <DetailItem color="#00CED1">
                    <div className="label">Apparent Magnitude</div>
                    <div className="value">{selectedStar.magnitude}</div>
                  </DetailItem>
                  <DetailItem color="#FF6B6B">
                    <div className="label">Spectral Type</div>
                    <div className="value">{selectedStar.spectralType}</div>
                  </DetailItem>
                  <DetailItem color="#4ECDC4">
                    <div className="label">Right Ascension</div>
                    <div className="value">{selectedStar.ra.toFixed(2)}°</div>
                  </DetailItem>
                  <DetailItem color="#FFB347">
                    <div className="label">Declination</div>
                    <div className="value">{selectedStar.dec.toFixed(2)}°</div>
                  </DetailItem>
                </DetailGrid>
              </DetailPanel>
            )}
            
            {/* Star Legend */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '15px', 
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              maxWidth: '800px'
            }}>
              <span style={{ color: '#888' }}>Click on any star to see details</span>
              <span style={{ color: '#B5D4FF' }}>● Blue: Hot stars (O/B type)</span>
              <span style={{ color: '#FFF5E0' }}>● White: Solar-type (F/G type)</span>
              <span style={{ color: '#FF8C4B' }}>● Orange/Red: Cool stars (K/M type)</span>
            </div>
          </>
        )}

        {viewMode === 'analysis' && (
          <>
            <Plot
              data={[distanceHistTrace]}
              layout={histLayout}
              style={{ width: '100%', maxWidth: '900px', height: '400px' }}
              config={{ responsive: true }}
            />
            <Plot
              data={[sizeDistanceTrace]}
              layout={sizeDistanceLayout}
              style={{ width: '100%', maxWidth: '900px', height: '500px' }}
              config={{ responsive: true }}
            />
          </>
        )}
      </PlotContainer>
    </PageContainer>
  );
};

export default SpaceMap;
