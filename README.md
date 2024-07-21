
# Astrophysics ETL and Visualization Web Application

This project is a web application for extracting, transforming, and visualizing astrophysical data, specifically focusing on near-Earth objects (NEOs) recorded by NASA. The application uses React for the frontend and includes interactive visualizations powered by Plotly.js.

## Project Structure

```
/astrophysics-app
  /public
    /data
      astrophysical_data_cleaned.json
  /src
    /components
      Navbar.js
    /pages
      Home.js
      Research.js
    App.js
    index.js
/scripts
  extract.py
  transform.py
/data
  astrophysical_data.csv
  astrophysical_data_cleaned.csv
```

## Features

- **Data Extraction, Transformation, and Loading (ETL):** Python scripts are used to fetch data from the NASA API, transform it, and save it as JSON and CSV files.
- **Interactive Visualizations:** The web application uses Plotly.js to create interactive scatter plots, histograms, box plots, and scatter plot matrices.
- **Navigation Bar:** Includes a navigation bar with links to the Home and Research Findings pages.
- **Responsive Design:** The application is responsive and adapts to different screen sizes.

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

- **public/data:** Contains the cleaned astrophysical data in JSON format.
- **src/components/Navbar.js:** The navigation bar component.
- **src/pages/Home.js:** The home page containing data visualizations.
- **src/pages/Research.js:** The research findings page with explanations of the data and findings.
- **src/App.js:** The main application file that sets up routing.
- **scripts/extract.py:** Python script for extracting data from the NASA API.
- **scripts/transform.py:** Python script for transforming the extracted data.
- **data/astrophysical_data.csv:** Raw data extracted from the NASA API.
- **data/astrophysical_data_cleaned.csv:** Transformed and cleaned data.

## Usage

### Home Page

The home page features interactive visualizations, including:

- Scatter plot of diameter vs. distance
- Histograms of diameter and distance
- Box plots of diameter and distance
- Scatter plot matrix for multivariate analysis

You can apply filters to the data using the input fields provided and see the updated visualizations.

### Research Findings Page

The research findings page provides a detailed explanation of the data and key findings from the analysis, including insights into the distribution and characteristics of near-Earth objects.

## Author

Sam Chakraborty

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NASA for providing the API to access near-Earth object data.
- Plotly.js for interactive visualizations.
- React for the frontend framework.
