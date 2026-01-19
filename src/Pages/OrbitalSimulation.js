import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

const PageContainer = styled.div`
  background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0c0c1e 100%);
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
  max-width: 800px;
  margin: 0 auto 30px;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.label`
  color: #00d4ff;
  margin-bottom: 8px;
  font-weight: bold;
`;

const Select = styled.select`
  padding: 10px 20px;
  border: 2px solid #00d4ff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.2);
  }

  option {
    background: #1a1a3e;
  }
`;

const Button = styled.button`
  padding: 12px 30px;
  background: linear-gradient(45deg, #00d4ff, #0066ff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const InfoPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
`;

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid ${props => props.color || '#00d4ff'};

  h4 {
    color: ${props => props.color || '#00d4ff'};
    margin: 0 0 8px 0;
    font-size: 0.9rem;
  }

  p {
    color: #fff;
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
`;

const LegendDot = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const OrbitalSimulation = () => {
  const [data, setData] = useState([]);
  const [selectedNeo, setSelectedNeo] = useState(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_enhanced.json`);
      const data = await response.json();
      setData(data);
      if (data.length > 0) {
        setSelectedNeo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to old data format
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_cleaned.json`);
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching fallback data:', err);
      }
    }
  };

  // Function to calculate orbit points from Keplerian elements
  const calculateOrbit = (a, e, i, omega, Omega, numPoints = 360) => {
    const points = { x: [], y: [], z: [] };
    const iRad = (i * Math.PI) / 180;
    const omegaRad = (omega * Math.PI) / 180;
    const OmegaRad = (Omega * Math.PI) / 180;

    for (let theta = 0; theta < 360; theta += 360 / numPoints) {
      const thetaRad = (theta * Math.PI) / 180;
      
      // Calculate radius at this angle
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(thetaRad));
      
      // Position in orbital plane
      const xOrbital = r * Math.cos(thetaRad);
      const yOrbital = r * Math.sin(thetaRad);
      
      // Rotate to 3D space
      const x = (Math.cos(OmegaRad) * Math.cos(omegaRad) - Math.sin(OmegaRad) * Math.sin(omegaRad) * Math.cos(iRad)) * xOrbital +
                (-Math.cos(OmegaRad) * Math.sin(omegaRad) - Math.sin(OmegaRad) * Math.cos(omegaRad) * Math.cos(iRad)) * yOrbital;
      const y = (Math.sin(OmegaRad) * Math.cos(omegaRad) + Math.cos(OmegaRad) * Math.sin(omegaRad) * Math.cos(iRad)) * xOrbital +
                (-Math.sin(OmegaRad) * Math.sin(omegaRad) + Math.cos(OmegaRad) * Math.cos(omegaRad) * Math.cos(iRad)) * yOrbital;
      const z = Math.sin(omegaRad) * Math.sin(iRad) * xOrbital + Math.cos(omegaRad) * Math.sin(iRad) * yOrbital;
      
      points.x.push(x);
      points.y.push(y);
      points.z.push(z);
    }
    
    return points;
  };

  // Calculate NEO current position
  const calculatePosition = useCallback((neo, frame) => {
    if (!neo.semi_major_axis) return { x: 0, y: 0, z: 0 };
    
    const a = neo.semi_major_axis;
    const e = neo.eccentricity || 0.1;
    const i = (neo.inclination || 0) * Math.PI / 180;
    const omega = (neo.argument_of_perihelion || 0) * Math.PI / 180;
    const Omega = (neo.longitude_ascending_node || 0) * Math.PI / 180;
    const M = ((neo.mean_anomaly || 0) + frame) * Math.PI / 180;
    
    // Solve Kepler's equation (simplified)
    let E = M;
    for (let j = 0; j < 10; j++) {
      E = M + e * Math.sin(E);
    }
    
    const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));
    const r = a * (1 - e * Math.cos(E));
    
    const xOrbital = r * Math.cos(trueAnomaly);
    const yOrbital = r * Math.sin(trueAnomaly);
    
    const x = (Math.cos(Omega) * Math.cos(omega) - Math.sin(Omega) * Math.sin(omega) * Math.cos(i)) * xOrbital +
              (-Math.cos(Omega) * Math.sin(omega) - Math.sin(Omega) * Math.cos(omega) * Math.cos(i)) * yOrbital;
    const y = (Math.sin(Omega) * Math.cos(omega) + Math.cos(Omega) * Math.sin(omega) * Math.cos(i)) * xOrbital +
              (-Math.sin(Omega) * Math.sin(omega) + Math.cos(Omega) * Math.cos(omega) * Math.cos(i)) * yOrbital;
    const z = Math.sin(omega) * Math.sin(i) * xOrbital + Math.cos(omega) * Math.sin(i) * yOrbital;
    
    return { x, y, z };
  }, []);

  // Animation effect
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationFrame(prev => (prev + 2) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Earth's orbit (approximately circular at 1 AU)
  const earthOrbit = calculateOrbit(1, 0.017, 0, 0, 0);
  
  // Mars orbit for reference
  const marsOrbit = calculateOrbit(1.524, 0.093, 1.85, 286.5, 49.6);

  // Selected NEO orbit
  const neoOrbit = selectedNeo?.semi_major_axis ? 
    calculateOrbit(
      selectedNeo.semi_major_axis,
      selectedNeo.eccentricity || 0.1,
      selectedNeo.inclination || 0,
      selectedNeo.argument_of_perihelion || 0,
      selectedNeo.longitude_ascending_node || 0
    ) : null;

  // Current positions
  const earthAngle = (animationFrame * Math.PI) / 180;
  const earthPos = { x: Math.cos(earthAngle), y: Math.sin(earthAngle), z: 0 };
  const neoPos = selectedNeo ? calculatePosition(selectedNeo, animationFrame) : { x: 0, y: 0, z: 0 };

  // Create plot traces
  const traces = [
    // Sun
    {
      type: 'scatter3d',
      mode: 'markers',
      x: [0],
      y: [0],
      z: [0],
      marker: {
        size: 20,
        color: '#FFD700',
        symbol: 'circle'
      },
      name: 'Sun',
      hovertemplate: 'Sun<extra></extra>'
    },
    // Earth orbit
    {
      type: 'scatter3d',
      mode: 'lines',
      x: earthOrbit.x,
      y: earthOrbit.y,
      z: earthOrbit.z,
      line: { color: '#4169E1', width: 2 },
      name: 'Earth Orbit',
      hoverinfo: 'skip'
    },
    // Earth position
    {
      type: 'scatter3d',
      mode: 'markers',
      x: [earthPos.x],
      y: [earthPos.y],
      z: [earthPos.z],
      marker: { size: 12, color: '#4169E1' },
      name: 'Earth',
      hovertemplate: 'Earth<br>Position: (%.2f, %.2f, %.2f) AU<extra></extra>'
    },
    // Mars orbit
    {
      type: 'scatter3d',
      mode: 'lines',
      x: marsOrbit.x,
      y: marsOrbit.y,
      z: marsOrbit.z,
      line: { color: '#CD853F', width: 1.5, dash: 'dash' },
      name: 'Mars Orbit',
      hoverinfo: 'skip'
    }
  ];

  // Add NEO orbit and position if selected
  if (neoOrbit && selectedNeo) {
    traces.push({
      type: 'scatter3d',
      mode: 'lines',
      x: neoOrbit.x,
      y: neoOrbit.y,
      z: neoOrbit.z,
      line: { 
        color: selectedNeo.is_potentially_hazardous ? '#FF4444' : '#00FF88', 
        width: 3 
      },
      name: `${selectedNeo.name} Orbit`,
      hoverinfo: 'skip'
    });

    traces.push({
      type: 'scatter3d',
      mode: 'markers',
      x: [neoPos.x],
      y: [neoPos.y],
      z: [neoPos.z],
      marker: { 
        size: 10, 
        color: selectedNeo.is_potentially_hazardous ? '#FF4444' : '#00FF88',
        symbol: 'diamond'
      },
      name: selectedNeo.name,
      hovertemplate: `${selectedNeo.name}<br>Position: (%{x:.2f}, %{y:.2f}, %{z:.2f}) AU<extra></extra>`
    });
  }

  const layout = {
    title: {
      text: '3D Orbital Simulation',
      font: { color: '#00d4ff', size: 20 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      xaxis: { 
        title: 'X (AU)', 
        color: '#666',
        gridcolor: '#333',
        zerolinecolor: '#444'
      },
      yaxis: { 
        title: 'Y (AU)', 
        color: '#666',
        gridcolor: '#333',
        zerolinecolor: '#444'
      },
      zaxis: { 
        title: 'Z (AU)', 
        color: '#666',
        gridcolor: '#333',
        zerolinecolor: '#444'
      },
      bgcolor: 'rgba(10, 10, 30, 0.8)',
      aspectmode: 'cube',
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1 }
      }
    },
    showlegend: true,
    legend: {
      font: { color: '#ccc' },
      bgcolor: 'rgba(0,0,0,0.5)'
    },
    margin: { t: 50, b: 0, l: 0, r: 0 }
  };

  return (
    <PageContainer>
      <Header>🌌 Orbital Simulation</Header>
      <Description>
        Visualize the orbits of Near-Earth Objects in 3D space. 
        Select an asteroid to see its orbital path around the Sun, 
        compared to Earth's and Mars' orbits. Use the animation controls 
        to watch the objects move along their paths.
      </Description>

      <ControlPanel>
        <ControlGroup>
          <Label>Select Near-Earth Object</Label>
          <Select 
            value={selectedNeo?.name || ''} 
            onChange={(e) => {
              const neo = data.find(d => d.name === e.target.value);
              setSelectedNeo(neo);
            }}
          >
            {data.map(neo => (
              <option key={neo.name} value={neo.name}>
                {neo.name} {neo.is_potentially_hazardous ? '⚠️' : ''}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <Label>Animation</Label>
          <Button onClick={() => setIsAnimating(!isAnimating)}>
            {isAnimating ? '⏸ Pause' : '▶ Play'}
          </Button>
        </ControlGroup>

        <ControlGroup>
          <Label>Reset Position</Label>
          <Button onClick={() => setAnimationFrame(0)}>🔄 Reset</Button>
        </ControlGroup>
      </ControlPanel>

      {selectedNeo && (
        <InfoPanel>
          <InfoCard color="#00d4ff">
            <h4>Semi-Major Axis</h4>
            <p>{selectedNeo.semi_major_axis?.toFixed(3) || 'N/A'} AU</p>
          </InfoCard>
          <InfoCard color="#FF6B6B">
            <h4>Eccentricity</h4>
            <p>{selectedNeo.eccentricity?.toFixed(4) || 'N/A'}</p>
          </InfoCard>
          <InfoCard color="#4ECDC4">
            <h4>Inclination</h4>
            <p>{selectedNeo.inclination?.toFixed(2) || 'N/A'}°</p>
          </InfoCard>
          <InfoCard color="#FFE66D">
            <h4>Orbital Period</h4>
            <p>{selectedNeo.orbital_period?.toFixed(0) || 'N/A'} days</p>
          </InfoCard>
          <InfoCard color="#95E1D3">
            <h4>Diameter</h4>
            <p>{selectedNeo.diameter?.toFixed(3) || 'N/A'} km</p>
          </InfoCard>
          <InfoCard color={selectedNeo.is_potentially_hazardous ? '#FF4444' : '#00FF88'}>
            <h4>Hazard Status</h4>
            <p>{selectedNeo.is_potentially_hazardous ? '⚠️ Potentially Hazardous' : '✅ Safe'}</p>
          </InfoCard>
        </InfoPanel>
      )}

      <PlotContainer>
        <Plot
          data={traces}
          layout={layout}
          style={{ width: '100%', maxWidth: '1000px', height: '700px' }}
          config={{ responsive: true, displayModeBar: true }}
        />
      </PlotContainer>

      <Legend>
        <LegendItem>
          <LegendDot color="#FFD700" />
          <span>Sun</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#4169E1" />
          <span>Earth</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#CD853F" />
          <span>Mars</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#00FF88" />
          <span>Safe NEO</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#FF4444" />
          <span>Potentially Hazardous</span>
        </LegendItem>
      </Legend>
    </PageContainer>
  );
};

export default OrbitalSimulation;
