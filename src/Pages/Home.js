import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import styled from 'styled-components';

const Header = styled.h2`
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex: 1 1 20%;
  margin: 5px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  flex: 1 1 20%;
  margin: 5px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const PlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
      const response = await fetch('/data/astrophysical_data_cleaned.json');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    fetchData();
  };

  const filteredData = applyFilters(data, filters);

  const trace1 = {
    x: filteredData.map(d => d.diameter),
    y: filteredData.map(d => d.distance),
    mode: 'markers',
    type: 'scatter',
    name: 'Scatter Plot',
    text: filteredData.map(d => `Name: ${d.name}`),  // Adding hover text
    hoverinfo: 'text'  // Configuring hover information
  };

  const trace2 = {
    x: filteredData.map(d => d.diameter),
    type: 'histogram',
    name: 'Histogram of Diameter',
    marker: {
      color: 'rgba(100, 200, 102, 0.7)',
    },
  };

  const trace3 = {
    y: filteredData.map(d => d.distance),
    type: 'histogram',
    name: 'Histogram of Distance',
    marker: {
      color: 'rgba(255, 100, 102, 0.7)',
    },
  };

  const trace4 = {
    x: filteredData.map(d => d.diameter),
    type: 'box',
    name: 'Box Plot of Diameter',
    marker: {
      color: 'rgba(100, 200, 102, 0.7)',
    },
  };

  const trace5 = {
    y: filteredData.map(d => d.distance),
    type: 'box',
    name: 'Box Plot of Distance',
    marker: {
      color: 'rgba(255, 100, 102, 0.7)',
    },
  };

  const trace6 = {
    type: 'splom',
    dimensions: [
      {label: 'Diameter', values: filteredData.map(d => d.diameter)},
      {label: 'Distance', values: filteredData.map(d => d.distance)}
    ],
    marker: {color: 'rgba(100, 200, 102, 0.7)'}
  };

  const layout1 = {
    grid: { rows: 2, columns: 2, pattern: 'independent' },
    xaxis: { title: 'Diameter (km)', domain: [0, 0.45] },
    yaxis: { title: 'Distance (km)', domain: [0, 0.45] },
    xaxis2: { title: 'Diameter (km)', domain: [0.55, 1] },
    yaxis2: { title: 'Count', anchor: 'x2' },
    xaxis3: { title: 'Count', domain: [0, 0.45], anchor: 'y3' },
    yaxis3: { title: 'Distance (km)', domain: [0.55, 1] },
    height: 600,
    width: 800,
    title: 'Astrophysical Data Analysis'
  };

  const layout2 = {
    grid: { rows: 1, columns: 2, pattern: 'independent' },
    height: 600,
    width: 800,
    title: 'Box Plots of Diameter and Distance'
  };

  const layout3 = {
    height: 600,
    width: 800,
    title: 'Scatter Plot Matrix'
  };

  return (
    <div>
      <Header>Astrophysical Data</Header>
      <Form onSubmit={handleSubmit}>
        <Input
          type="number"
          name="min_diameter"
          placeholder="Min Diameter"
          value={filters.min_diameter}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="max_diameter"
          placeholder="Max Diameter"
          value={filters.max_diameter}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="min_distance"
          placeholder="Min Distance"
          value={filters.min_distance}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="max_distance"
          placeholder="Max Distance"
          value={filters.max_distance}
          onChange={handleChange}
        />
        <Button type="submit">Apply Filters</Button>
      </Form>
      <PlotContainer>
        <Plot
          data={[trace1, trace2, trace3]}
          layout={layout1}
          config={{ responsive: true, displayModeBar: true }}  // Adding interactivity
        />
        <Plot
          data={[trace4, trace5]}
          layout={layout2}
          config={{ responsive: true, displayModeBar: true }}  // Adding interactivity
        />
        <Plot
          data={[trace6]}
          layout={layout3}
          config={{ responsive: true, displayModeBar: true }}  // Adding interactivity
        />
      </PlotContainer>
    </div>
  );
}

export default Home;
