import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

const PageContainer = styled.div`
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
  min-height: 100vh;
  padding: 30px 20px;
  color: #fff;
`;

const Header = styled.h2`
  text-align: center;
  color: #00d4ff;
  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(0,212,255,0.2), rgba(0,100,255,0.1)'});
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);

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

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
`;

const Input = styled.input`
  flex: 1 1 150px;
  max-width: 200px;
  padding: 12px 15px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button`
  padding: 12px 30px;
  background: linear-gradient(45deg, #00d4ff, #0066ff);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }
`;

const PlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const PlotCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  max-width: 1000px;
`;

const PlotTitle = styled.h3`
  color: #00d4ff;
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const PlotRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Home = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    min_diameter: '',
    max_diameter: '',
    min_distance: '',
    max_distance: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try enhanced data first
      const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_enhanced.json`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/astrophysical_data_cleaned.json`);
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
  };

  const applyFilters = (data, filters) => {
    return data.filter(item => 
      (!filters.min_diameter || item.diameter >= filters.min_diameter) &&
      (!filters.max_diameter || item.diameter <= filters.max_diameter) &&
      (!filters.min_distance || item.distance >= filters.min_distance) &&
      (!filters.max_distance || item.distance <= filters.max_distance)
    );
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const filteredData = applyFilters(data, filters);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return {};
    const avgDiameter = filteredData.reduce((sum, d) => sum + d.diameter, 0) / filteredData.length;
    const avgDistance = filteredData.reduce((sum, d) => sum + d.distance, 0) / filteredData.length;
    const maxDiameter = Math.max(...filteredData.map(d => d.diameter));
    const minDistance = Math.min(...filteredData.map(d => d.distance));
    const hazardous = filteredData.filter(d => d.is_potentially_hazardous).length;
    return { avgDiameter, avgDistance, maxDiameter, minDistance, hazardous };
  }, [filteredData]);

  // Dark theme layout configuration
  const darkTheme = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(15, 15, 35, 0.8)',
    font: { color: '#ccc' }
  };

  // Enhanced scatter plot with size and color encoding
  const scatterTrace = {
    x: filteredData.map(d => d.diameter),
    y: filteredData.map(d => d.distance / 1e6),
    mode: 'markers',
    type: 'scatter',
    name: 'NEOs',
    text: filteredData.map(d => 
      `<b>${d.name}</b><br>` +
      `Diameter: ${d.diameter.toFixed(3)} km<br>` +
      `Distance: ${(d.distance / 1e6).toFixed(2)} M km<br>` +
      `${d.is_potentially_hazardous ? '⚠️ Potentially Hazardous' : '✅ Safe'}`
    ),
    hoverinfo: 'text',
    marker: {
      size: filteredData.map(d => Math.max(8, d.diameter * 12)),
      color: filteredData.map(d => d.relative_velocity || d.distance / 1e6),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: { text: 'Velocity/Distance', font: { color: '#ccc' } },
        tickfont: { color: '#ccc' }
      },
      opacity: 0.8,
      line: { color: 'rgba(255,255,255,0.3)', width: 1 }
    }
  };

  const scatterLayout = {
    ...darkTheme,
    title: { text: 'Diameter vs Distance', font: { color: '#00d4ff', size: 18 } },
    xaxis: { 
      title: 'Diameter (km)', 
      color: '#666', 
      gridcolor: '#333',
      type: 'log',
      tickfont: { color: '#888' }
    },
    yaxis: { 
      title: 'Distance (million km)', 
      color: '#666', 
      gridcolor: '#333',
      tickfont: { color: '#888' }
    },
    hovermode: 'closest'
  };

  // Histogram of Diameter with gradient
  const diameterHistTrace = {
    x: filteredData.map(d => d.diameter),
    type: 'histogram',
    nbinsx: 25,
    name: 'Diameter Distribution',
    marker: {
      color: 'rgba(0, 212, 255, 0.7)',
      line: { color: '#00d4ff', width: 1 }
    }
  };

  const diameterHistLayout = {
    ...darkTheme,
    title: { text: 'Diameter Distribution', font: { color: '#00d4ff', size: 16 } },
    xaxis: { title: 'Diameter (km)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Count', color: '#666', gridcolor: '#333' },
    bargap: 0.1
  };

  // Histogram of Distance
  const distanceHistTrace = {
    x: filteredData.map(d => d.distance / 1e6),
    type: 'histogram',
    nbinsx: 25,
    name: 'Distance Distribution',
    marker: {
      color: 'rgba(255, 107, 107, 0.7)',
      line: { color: '#ff6b6b', width: 1 }
    }
  };

  const distanceHistLayout = {
    ...darkTheme,
    title: { text: 'Distance Distribution', font: { color: '#ff6b6b', size: 16 } },
    xaxis: { title: 'Distance (million km)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Count', color: '#666', gridcolor: '#333' },
    bargap: 0.1
  };

  // Violin plot for diameter
  const violinTrace = {
    type: 'violin',
    y: filteredData.map(d => d.diameter),
    box: { visible: true },
    meanline: { visible: true },
    name: 'Diameter',
    marker: { color: '#4ECDC4' },
    fillcolor: 'rgba(78, 205, 196, 0.5)'
  };

  const violinLayout = {
    ...darkTheme,
    title: { text: 'Diameter Distribution (Violin Plot)', font: { color: '#4ECDC4', size: 16 } },
    yaxis: { title: 'Diameter (km)', color: '#666', gridcolor: '#333' }
  };

  // 3D scatter plot
  const scatter3DTrace = {
    type: 'scatter3d',
    mode: 'markers',
    x: filteredData.map(d => d.diameter),
    y: filteredData.map(d => d.distance / 1e6),
    z: filteredData.map(d => d.relative_velocity || 20),
    text: filteredData.map(d => d.name),
    marker: {
      size: filteredData.map(d => Math.max(4, d.diameter * 8)),
      color: filteredData.map(d => d.is_potentially_hazardous ? '#FF4444' : '#00d4ff'),
      opacity: 0.8
    },
    hovertemplate: '%{text}<br>Diameter: %{x:.3f} km<br>Distance: %{y:.2f} M km<br>Velocity: %{z:.1f} km/s<extra></extra>'
  };

  const scatter3DLayout = {
    ...darkTheme,
    title: { text: '3D Analysis: Diameter × Distance × Velocity', font: { color: '#00d4ff', size: 18 } },
    scene: {
      xaxis: { title: 'Diameter (km)', color: '#666', gridcolor: '#333' },
      yaxis: { title: 'Distance (M km)', color: '#666', gridcolor: '#333' },
      zaxis: { title: 'Velocity (km/s)', color: '#666', gridcolor: '#333' },
      bgcolor: 'rgba(10, 10, 30, 0.9)'
    },
    margin: { t: 50, b: 0, l: 0, r: 0 }
  };

  // Parallel coordinates for multivariate analysis
  const parallelTrace = {
    type: 'parcoords',
    line: {
      color: filteredData.map(d => d.distance),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: { text: 'Distance', font: { color: '#ccc' } },
        tickfont: { color: '#ccc' }
      }
    },
    dimensions: [
      { label: 'Diameter (km)', values: filteredData.map(d => d.diameter) },
      { label: 'Distance (M km)', values: filteredData.map(d => d.distance / 1e6) },
      { label: 'Velocity (km/s)', values: filteredData.map(d => d.relative_velocity || 20) },
      { label: 'Orbital Period (days)', values: filteredData.map(d => d.orbital_period || 365) },
      { label: 'Eccentricity', values: filteredData.map(d => d.eccentricity || 0.2) }
    ]
  };

  const parallelLayout = {
    ...darkTheme,
    title: { text: 'Multivariate Analysis (Parallel Coordinates)', font: { color: '#9370DB', size: 18 } }
  };

  return (
    <PageContainer>
      <Header>🔭 Near-Earth Objects Analysis</Header>
      <Subtitle>Interactive visualization and analysis of asteroid data from NASA</Subtitle>
      
      <StatsRow>
        <StatCard gradient="rgba(0,212,255,0.2), rgba(0,100,255,0.1)" valueColor="#00d4ff">
          <div className="value">{filteredData.length}</div>
          <div className="label">Total NEOs</div>
        </StatCard>
        <StatCard gradient="rgba(255,107,107,0.2), rgba(255,50,50,0.1)" valueColor="#ff6b6b">
          <div className="value">{stats.hazardous || 0}</div>
          <div className="label">Potentially Hazardous</div>
        </StatCard>
        <StatCard gradient="rgba(78,205,196,0.2), rgba(68,160,141,0.1)" valueColor="#4ECDC4">
          <div className="value">{stats.avgDiameter?.toFixed(2) || 'N/A'}</div>
          <div className="label">Avg Diameter (km)</div>
        </StatCard>
        <StatCard gradient="rgba(255,215,0,0.2), rgba(255,180,0,0.1)" valueColor="#FFD700">
          <div className="value">{stats.maxDiameter?.toFixed(2) || 'N/A'}</div>
          <div className="label">Max Diameter (km)</div>
        </StatCard>
        <StatCard gradient="rgba(147,112,219,0.2), rgba(120,90,180,0.1)" valueColor="#9370DB">
          <div className="value">{(stats.minDistance / 1e6)?.toFixed(2) || 'N/A'}</div>
          <div className="label">Closest (M km)</div>
        </StatCard>
      </StatsRow>

      <Form onSubmit={handleSubmit}>
        <Input
          type="number"
          name="min_diameter"
          placeholder="Min Diameter (km)"
          value={filters.min_diameter}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="max_diameter"
          placeholder="Max Diameter (km)"
          value={filters.max_diameter}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="min_distance"
          placeholder="Min Distance (km)"
          value={filters.min_distance}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="max_distance"
          placeholder="Max Distance (km)"
          value={filters.max_distance}
          onChange={handleChange}
        />
        <Button type="submit">Apply Filters</Button>
      </Form>

      <PlotContainer>
        {/* Main Scatter Plot */}
        <PlotCard>
          <PlotTitle>📊 Diameter vs Distance Analysis</PlotTitle>
          <Plot
            data={[scatterTrace]}
            layout={scatterLayout}
            style={{ width: '100%', height: '500px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        </PlotCard>

        {/* Histograms side by side */}
        <PlotRow>
          <PlotCard>
            <PlotTitle>📈 Diameter Distribution</PlotTitle>
            <Plot
              data={[diameterHistTrace]}
              layout={diameterHistLayout}
              style={{ width: '100%', height: '350px' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </PlotCard>
          <PlotCard>
            <PlotTitle>📉 Distance Distribution</PlotTitle>
            <Plot
              data={[distanceHistTrace]}
              layout={distanceHistLayout}
              style={{ width: '100%', height: '350px' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </PlotCard>
        </PlotRow>

        {/* Violin Plot */}
        <PlotCard>
          <PlotTitle>🎻 Statistical Distribution (Violin Plot)</PlotTitle>
          <Plot
            data={[violinTrace]}
            layout={violinLayout}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </PlotCard>

        {/* 3D Scatter */}
        <PlotCard>
          <PlotTitle>🌐 3D Multivariate Analysis</PlotTitle>
          <Plot
            data={[scatter3DTrace]}
            layout={scatter3DLayout}
            style={{ width: '100%', height: '600px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        </PlotCard>

        {/* Parallel Coordinates */}
        <PlotCard>
          <PlotTitle>🔗 Parallel Coordinates Plot</PlotTitle>
          <Plot
            data={[parallelTrace]}
            layout={parallelLayout}
            style={{ width: '100%', height: '500px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        </PlotCard>
      </PlotContainer>
    </PageContainer>
  );
}

export default Home;
