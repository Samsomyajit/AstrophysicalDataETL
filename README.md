
# Astrophysics ETL and Visualization Web Application

This project is a web application for extracting, transforming, and visualizing astrophysical data, specifically focusing on near-Earth objects (NEOs) recorded by NASA. The application uses React for the frontend and includes interactive visualizations powered by Plotly.js.

## ✨ Features

### 🔭 Home - Data Analysis Dashboard
- **Interactive Scatter Plot**: Diameter vs Distance analysis with color-coded velocity
- **Distribution Histograms**: Visualize diameter and distance distributions
- **Violin Plot**: Statistical distribution analysis
- **3D Multivariate Analysis**: Explore relationships between diameter, distance, and velocity
- **Parallel Coordinates Plot**: Multivariate analysis across 5 dimensions

### 🪐 Orbital Simulation
- **3D Orbital Visualization**: Interactive 3D view of NEO orbits around the Sun
- **Reference Orbits**: Earth and Mars orbits for comparison
- **Animation Controls**: Play/pause orbital motion simulation
- **Orbital Parameters Display**: Semi-major axis, eccentricity, inclination, period

### 🗺️ Space Map
- **2D Polar View**: Radial distribution of NEOs relative to Earth
- **3D Space View**: Spatial distribution in 3D coordinates
- **Analysis View**: Additional statistical charts
- **Interactive Filters**: Distance range and size filters

### 🛰️ Orbital Tracking Dashboard
- **Closest Approaches Table**: Track NEOs with nearest approach distances
- **Approach Timeline**: Visual timeline of upcoming approaches
- **Velocity Distribution**: Histogram of relative velocities
- **Kepler's Third Law Visualization**: Orbital period vs semi-major axis
- **Filter & Sort Options**: Filter by hazard status, proximity, or size

### 📚 Research Findings
- **Statistical Analysis**: Mean, median, standard deviation calculations
- **Cumulative Size Distribution**: Power-law distribution visualization
- **Hazard Assessment**: Classification of potentially hazardous objects
- **Correlation Analysis**: Diameter-distance correlation coefficients
- **Key Insights**: Automated insights from the data

## 🎨 Design Features
- **Dark Theme**: Space-inspired dark theme throughout
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Visualizations**: Zoom, pan, hover tooltips on all charts
- **Modern UI**: Gradient backgrounds, glowing effects, smooth animations

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.x
- A NASA API key (you can get one from the [NASA API website](https://api.nasa.gov/))

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/astrophysics-app.git
   cd astrophysics-app
   ```

2. **Run the ETL Scripts:**

   Replace `your_nasa_api_key` with your actual NASA API key in `extract.py`.

   ```bash
   cd scripts
   python extract.py
   python transform.py
   ```

   Move the generated JSON file to the `public/data` directory:

   ```bash
   mv data/astrophysical_data_cleaned.json ../public/data/astrophysical_data_cleaned.json
   ```

3. **Install Node.js Dependencies:**
   ```bash
   cd ../astrophysics-app
   npm install
   ```

4. **Start the React Application:**
   ```bash
   npm start
   ```

   The application should now be running on `http://localhost:3000`.

## Project Structure

```
/astrophysics-app
  /public
    /data
      astrophysical_data_cleaned.json
      astrophysical_data_enhanced.json  (with orbital parameters)
  /src
    /components
      Navbar.js
    /Pages
      Home.js              - Main analysis dashboard
      Research.js          - Statistical research findings
      OrbitalSimulation.js - 3D orbital visualization
      SpaceMap.js          - 2D/3D space map
      OrbitalTracking.js   - Tracking dashboard
    App.js
    index.js
/scripts
  extract.py
  transform.py
```

## Usage

### 🔭 Home Page
The home page features interactive visualizations including:
- Scatter plot of diameter vs. distance with velocity encoding
- Distribution histograms for diameter and distance
- Violin plot for statistical analysis
- 3D scatter plot for multivariate analysis
- Parallel coordinates plot

### 🪐 Orbital Simulation
- Select any NEO to visualize its orbit in 3D
- Compare with Earth and Mars orbits
- Animate orbital motion with play/pause controls
- View orbital parameters (semi-major axis, eccentricity, inclination)

### 🗺️ Space Map
- View NEO distribution in 2D polar or 3D views
- Filter by distance and size
- Analyze spatial patterns

### 🛰️ Orbital Tracking
- Monitor closest approach distances
- View approach timeline
- Analyze velocity distributions
- Visualize Kepler's Third Law

### 📚 Research Findings
Detailed statistical analysis with:
- Size distribution analysis
- Hazard assessment
- Correlation analysis
- Key research conclusions

## Author

Sam Chakraborty

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NASA for providing the API to access near-Earth object data.
- Plotly.js for interactive visualizations.
- React for the frontend framework.
