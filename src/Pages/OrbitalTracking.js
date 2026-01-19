import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

const PageContainer = styled.div`
  background: linear-gradient(135deg, #0d0d20 0%, #1a1a35 50%, #0d0d20 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
`;

const Header = styled.h2`
  text-align: center;
  color: #4ECDC4;
  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
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
  color: ${props => props.color || '#4ECDC4'};
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
    color: #4ECDC4;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  td {
    color: #ccc;
  }

  tr:hover td {
    background: rgba(78, 205, 196, 0.1);
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.type === 'danger' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(78, 205, 196, 0.3)'};
  color: ${props => props.type === 'danger' ? '#FF4444' : '#4ECDC4'};
`;

const TimelineContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color || '#4ECDC4'};
  margin-top: 5px;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;

  h4 {
    color: #fff;
    margin: 0 0 5px 0;
    font-size: 1rem;
  }

  p {
    color: #888;
    margin: 0;
    font-size: 0.85rem;
  }

  .date {
    color: #4ECDC4;
    font-weight: bold;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.active ? 'linear-gradient(45deg, #4ECDC4, #44A08D)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: ${props => props.active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(78,205,196,0.2), rgba(78,205,196,0.05)'});
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
    color: ${props => props.valueColor || '#4ECDC4'};
  }

  .label {
    color: #888;
    font-size: 0.85rem;
    margin-top: 5px;
  }
`;

const PlotContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Configuration constants
const MAX_TIMELINE_ITEMS = 30;
const MAX_TABLE_ITEMS = 8;
const MAX_TIMELINE_DISPLAY = 10;
const PHA_DISTANCE_THRESHOLD_KM = 7500000; // 0.05 AU ≈ 7.5 million km

const OrbitalTracking = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

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

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];
    
    if (filter === 'hazardous') {
      result = result.filter(d => d.is_potentially_hazardous);
    } else if (filter === 'close') {
      result = result.filter(d => d.distance < 10000000);
    } else if (filter === 'large') {
      result = result.filter(d => d.diameter > 0.5);
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'size') {
      result.sort((a, b) => b.diameter - a.diameter);
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.close_approach_date) - new Date(b.close_approach_date));
    } else if (sortBy === 'velocity') {
      result.sort((a, b) => (b.relative_velocity || 0) - (a.relative_velocity || 0));
    }

    return result;
  }, [data, filter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    if (data.length === 0) return {};
    
    const hazardous = data.filter(d => d.is_potentially_hazardous);
    const closeApproaches = data.filter(d => d.distance < PHA_DISTANCE_THRESHOLD_KM);
    const avgVelocity = data.reduce((sum, d) => sum + (d.relative_velocity || 0), 0) / data.length;
    const maxDiameter = Math.max(...data.map(d => d.diameter || 0));
    const minDistance = Math.min(...data.map(d => d.distance || Infinity));

    return {
      total: data.length,
      hazardous: hazardous.length,
      closeApproaches: closeApproaches.length,
      avgVelocity: avgVelocity.toFixed(1),
      maxDiameter: maxDiameter.toFixed(3),
      minDistance: (minDistance / 1e6).toFixed(2)
    };
  }, [data]);

  // Get timeline data subset
  const timelineData = processedData.slice(0, MAX_TIMELINE_ITEMS);
  
  // Velocity distribution chart
  const velocityTrace = {
    type: 'histogram',
    x: data.map(d => d.relative_velocity || 0),
    nbinsx: 15,
    marker: {
      color: 'rgba(78, 205, 196, 0.7)',
      line: { color: '#4ECDC4', width: 1 }
    },
    name: 'Velocity Distribution'
  };

  // Approach timeline (distance over time)
  const timelineTrace = {
    type: 'scatter',
    mode: 'markers+lines',
    x: timelineData.map(d => d.close_approach_date),
    y: timelineData.map(d => d.distance / 1e6),
    text: timelineData.map(d => d.name),
    marker: {
      size: timelineData.map(d => Math.max(8, d.diameter * 20)),
      color: timelineData.map(d => 
        d.is_potentially_hazardous ? '#FF4444' : '#4ECDC4'
      ),
      line: { color: 'white', width: 1 }
    },
    hovertemplate: '%{text}<br>Date: %{x}<br>Distance: %{y:.2f} million km<extra></extra>'
  };

  // Orbital period vs semi-major axis
  const orbitalTrace = {
    type: 'scatter',
    mode: 'markers',
    x: data.map(d => d.semi_major_axis || 1),
    y: data.map(d => d.orbital_period || 365),
    text: data.map(d => d.name),
    marker: {
      size: data.map(d => Math.max(6, d.diameter * 15)),
      color: data.map(d => d.eccentricity || 0.1),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: { text: 'Eccentricity', font: { color: '#ccc' } },
        tickfont: { color: '#ccc' }
      }
    },
    hovertemplate: '%{text}<br>Semi-Major Axis: %{x:.2f} AU<br>Period: %{y:.0f} days<extra></extra>'
  };

  const velocityLayout = {
    title: { text: 'Velocity Distribution', font: { color: '#4ECDC4', size: 16 } },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    xaxis: { title: 'Relative Velocity (km/s)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Count', color: '#666', gridcolor: '#333' },
    font: { color: '#ccc' },
    margin: { t: 50, b: 50, l: 50, r: 30 }
  };

  const timelineLayout = {
    title: { text: 'Close Approach Timeline', font: { color: '#4ECDC4', size: 16 } },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    xaxis: { title: 'Approach Date', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Distance (million km)', color: '#666', gridcolor: '#333' },
    font: { color: '#ccc' },
    showlegend: false,
    margin: { t: 50, b: 80, l: 60, r: 30 }
  };

  const orbitalLayout = {
    title: { text: 'Orbital Parameters (Kepler\'s Third Law)', font: { color: '#4ECDC4', size: 16 } },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(10, 10, 30, 0.8)',
    xaxis: { title: 'Semi-Major Axis (AU)', color: '#666', gridcolor: '#333' },
    yaxis: { title: 'Orbital Period (days)', color: '#666', gridcolor: '#333' },
    font: { color: '#ccc' },
    margin: { t: 50, b: 50, l: 60, r: 30 }
  };

  return (
    <PageContainer>
      <Header>🛰️ Orbital Tracking Dashboard</Header>
      <Description>
        Monitor and track Near-Earth Objects with comprehensive orbital data. 
        View approach timelines, velocity distributions, and orbital parameters. 
        Filter by hazard status, proximity, or size to focus on objects of interest.
      </Description>

      {/* Metrics Row */}
      <DashboardGrid>
        <MetricCard gradient="rgba(78,205,196,0.2), rgba(68,160,141,0.05)" valueColor="#4ECDC4">
          <div className="icon">🌍</div>
          <div className="value">{stats.total || 0}</div>
          <div className="label">Total NEOs Tracked</div>
        </MetricCard>
        <MetricCard gradient="rgba(255,68,68,0.2), rgba(255,68,68,0.05)" valueColor="#FF4444">
          <div className="icon">⚠️</div>
          <div className="value">{stats.hazardous || 0}</div>
          <div className="label">Potentially Hazardous</div>
        </MetricCard>
        <MetricCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)" valueColor="#FFD700">
          <div className="icon">🎯</div>
          <div className="value">{stats.closeApproaches || 0}</div>
          <div className="label">Close Approaches (&lt;7.5M km)</div>
        </MetricCard>
        <MetricCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)" valueColor="#9370DB">
          <div className="icon">💨</div>
          <div className="value">{stats.avgVelocity || 0}</div>
          <div className="label">Avg Velocity (km/s)</div>
        </MetricCard>
      </DashboardGrid>

      <FilterBar>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All Objects
        </FilterButton>
        <FilterButton active={filter === 'hazardous'} onClick={() => setFilter('hazardous')}>
          ⚠️ Hazardous Only
        </FilterButton>
        <FilterButton active={filter === 'close'} onClick={() => setFilter('close')}>
          🎯 Close Approaches
        </FilterButton>
        <FilterButton active={filter === 'large'} onClick={() => setFilter('large')}>
          🔴 Large Objects (&gt;0.5km)
        </FilterButton>
        <span style={{ color: '#666', padding: '10px' }}>|</span>
        <FilterButton active={sortBy === 'distance'} onClick={() => setSortBy('distance')}>
          Sort: Distance
        </FilterButton>
        <FilterButton active={sortBy === 'size'} onClick={() => setSortBy('size')}>
          Sort: Size
        </FilterButton>
        <FilterButton active={sortBy === 'velocity'} onClick={() => setSortBy('velocity')}>
          Sort: Velocity
        </FilterButton>
        <FilterButton active={sortBy === 'date'} onClick={() => setSortBy('date')}>
          Sort: Date
        </FilterButton>
      </FilterBar>

      <DashboardGrid>
        {/* Closest Approaches Table */}
        <Card>
          <CardTitle color="#FF6B6B">🎯 Closest Approaches</CardTitle>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Distance</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processedData.slice(0, MAX_TABLE_ITEMS).map((neo, i) => (
                <tr key={i}>
                  <td>{neo.name.substring(0, 20)}</td>
                  <td>{(neo.distance / 1e6).toFixed(2)} M km</td>
                  <td>{neo.diameter.toFixed(3)} km</td>
                  <td>
                    <Badge type={neo.is_potentially_hazardous ? 'danger' : 'safe'}>
                      {neo.is_potentially_hazardous ? 'PHA' : 'Safe'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Approach Timeline */}
        <Card>
          <CardTitle color="#4ECDC4">📅 Approach Timeline</CardTitle>
          <TimelineContainer>
            {processedData.slice(0, MAX_TIMELINE_DISPLAY).map((neo, i) => (
              <TimelineItem key={i}>
                <TimelineDot color={neo.is_potentially_hazardous ? '#FF4444' : '#4ECDC4'} />
                <TimelineContent>
                  <h4>{neo.name}</h4>
                  <p>
                    <span className="date">{neo.close_approach_date || 'TBD'}</span> • 
                    Distance: {(neo.distance / 1e6).toFixed(2)} M km • 
                    Velocity: {neo.relative_velocity?.toFixed(1) || 'N/A'} km/s
                  </p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineContainer>
        </Card>
      </DashboardGrid>

      {/* Charts */}
      <PlotContainer>
        <DashboardGrid>
          <Card style={{ gridColumn: 'span 1' }}>
            <Plot
              data={[velocityTrace]}
              layout={velocityLayout}
              style={{ width: '100%', height: '350px' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </Card>
          <Card style={{ gridColumn: 'span 1' }}>
            <Plot
              data={[timelineTrace]}
              layout={timelineLayout}
              style={{ width: '100%', height: '350px' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </Card>
        </DashboardGrid>

        <Card style={{ maxWidth: '900px', margin: '20px auto' }}>
          <Plot
            data={[orbitalTrace]}
            layout={orbitalLayout}
            style={{ width: '100%', height: '450px' }}
            config={{ responsive: true, displayModeBar: true }}
          />
        </Card>
      </PlotContainer>
    </PageContainer>
  );
};

export default OrbitalTracking;
