import React, { useState, useEffect } from 'react';
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

const SpaceMap = () => {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('2d');
  const [distanceRange, setDistanceRange] = useState(100);
  const [sizeFilter, setSizeFilter] = useState(0);

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
        Explore the spatial distribution of Near-Earth Objects around our planet. 
        Switch between polar and 3D views to understand where these cosmic neighbors 
        are located. Use the filters to focus on specific distance ranges and sizes.
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
          <h3>Average Diameter</h3>
          <p className="value">{avgDiameter.toFixed(2)}</p>
          <span className="unit">km</span>
        </StatCard>
      </StatsGrid>

      <ControlPanel>
        <TabButton active={viewMode === '2d'} onClick={() => setViewMode('2d')}>
          📍 2D Polar View
        </TabButton>
        <TabButton active={viewMode === '3d'} onClick={() => setViewMode('3d')}>
          🌐 3D Space View
        </TabButton>
        <TabButton active={viewMode === 'analysis'} onClick={() => setViewMode('analysis')}>
          📊 Analysis View
        </TabButton>

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
