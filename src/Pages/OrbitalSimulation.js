import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const Input = styled.input`
  padding: 10px 15px;
  border: 2px solid #00d4ff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 1rem;
  width: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
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

const DangerButton = styled(Button)`
  background: linear-gradient(45deg, #FF4444, #CC0000);
  
  &:hover {
    box-shadow: 0 5px 20px rgba(255, 68, 68, 0.4);
  }
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(45deg, #00FF88, #00CC6A);
  
  &:hover {
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
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

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 25px;
  margin: 20px auto;
  max-width: 1200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  color: ${props => props.color || '#00d4ff'};
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SimulationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(0,212,255,0.2), rgba(0,100,255,0.05)'});
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid ${props => props.borderColor || 'rgba(0, 212, 255, 0.3)'};

  .icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .value {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${props => props.valueColor || '#00d4ff'};
  }

  .unit {
    font-size: 0.9rem;
    color: #888;
    margin-left: 5px;
  }

  .label {
    color: #aaa;
    font-size: 0.9rem;
    margin-top: 8px;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  background: ${props => props.status === 'danger' ? 'rgba(255, 68, 68, 0.3)' : 
                props.status === 'warning' ? 'rgba(255, 215, 0, 0.3)' : 
                'rgba(0, 255, 136, 0.3)'};
  color: ${props => props.status === 'danger' ? '#FF4444' : 
           props.status === 'warning' ? '#FFD700' : 
           '#00FF88'};
`;

const PreventionMethodCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid ${props => props.selected ? '#00d4ff' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
    transform: translateY(-3px);
  }

  h4 {
    color: ${props => props.color || '#00d4ff'};
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    color: #888;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  overflow: hidden;
  margin: 15px 0;

  .fill {
    height: 100%;
    background: ${props => props.color || 'linear-gradient(90deg, #00d4ff, #0066ff)'};
    width: ${props => props.value || 0}%;
    transition: width 0.5s ease;
    border-radius: 10px;
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

const AlertBox = styled.div`
  background: ${props => props.type === 'danger' ? 'rgba(255, 68, 68, 0.2)' : 
               props.type === 'warning' ? 'rgba(255, 215, 0, 0.2)' : 
               'rgba(0, 255, 136, 0.2)'};
  border: 1px solid ${props => props.type === 'danger' ? '#FF4444' : 
                      props.type === 'warning' ? '#FFD700' : 
                      '#00FF88'};
  border-radius: 10px;
  padding: 15px 20px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    font-size: 1.5rem;
  }

  .message {
    color: #fff;
    flex: 1;
  }
`;

// Physical constants for simulations
const ATMOSPHERE_HEIGHT_KM = 100; // Karman line
const AIR_DENSITY_SEA_LEVEL = 1.225; // kg/m³
const DRAG_COEFFICIENT = 0.47; // Sphere
const ABLATION_HEAT = 6e6; // J/kg for silicate
const FRAGMENTATION_STRENGTH = 1e6; // Pa, typical for stony asteroid
const MIN_SPEED_OF_SOUND = 280; // m/s, minimum speed of sound in atmosphere
const SCALE_HEIGHT_KM = 8.5; // km, atmospheric scale height

// Impact calculation constants (based on Pi-scaling crater model)
// Reference: Melosh, H.J. (1989) Impact Cratering: A Geologic Process
const CRATER_SCALING_COEFF = 0.9; // Empirical coefficient for simple crater scaling
const CRATER_ENERGY_EXPONENT = 0.29; // Energy scaling exponent
const CRATER_KM_CONVERSION = 0.001; // Convert to km

// Seismic magnitude estimation constants
// Reference: Schultz & Gault (1975), simplified Gutenberg-Richter relation
const SEISMIC_LOG_COEFF = 0.67; // Coefficient for log10(energy)
const SEISMIC_OFFSET = -5.87; // Offset constant

// Fragmentation constants
const MAX_FRAGMENTS = 50; // Maximum number of fragments in DEM simulation
const FRAGMENT_PRESSURE_MULTIPLIER = 5; // Multiplier for pressure ratio to fragment count

const OrbitalSimulation = () => {
  const [data, setData] = useState([]);
  const [selectedNeo, setSelectedNeo] = useState(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState('orbital');
  
  // Hazard Detection & Prevention state
  const [detectionStatus, setDetectionStatus] = useState('monitoring');
  const [selectedPreventionMethod, setSelectedPreventionMethod] = useState('kinetic');
  const [deflectionProgress, setDeflectionProgress] = useState(0);
  const [isDeflecting, setIsDeflecting] = useState(false);
  
  // Atmospheric Entry CFD state
  const [entryVelocity, setEntryVelocity] = useState(15); // km/s
  const [entryAngle, setEntryAngle] = useState(45); // degrees
  const [isEntrySimulating, setIsEntrySimulating] = useState(false);
  const [entrySimulationTime, setEntrySimulationTime] = useState(0);
  const [cfdData, setCfdData] = useState(null);
  
  // Collision simulation state
  const [impactData, setImpactData] = useState(null);
  
  // DEM fragmentation state
  const [demFragments, setDemFragments] = useState([]);
  const [fragmentationActive, setFragmentationActive] = useState(false);

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

  // ============================================================================
  // CFD Atmospheric Entry Simulation
  // ============================================================================
  
  // Calculate atmospheric density at altitude (exponential atmosphere model)
  const calculateAtmosphericDensity = useCallback((altitude) => {
    return AIR_DENSITY_SEA_LEVEL * Math.exp(-altitude / SCALE_HEIGHT_KM);
  }, []);

  // Calculate dynamic pressure
  const calculateDynamicPressure = useCallback((density, velocity) => {
    return 0.5 * density * velocity * velocity;
  }, []);

  // Calculate drag force
  const calculateDragForce = useCallback((density, velocity, area) => {
    return 0.5 * DRAG_COEFFICIENT * density * velocity * velocity * area;
  }, []);

  // CFD Simulation for atmospheric entry
  const runCFDSimulation = useCallback(() => {
    if (!selectedNeo) return;
    
    const diameter = selectedNeo.diameter || 0.1; // km
    const radius = (diameter * 1000) / 2; // Convert km to m, then divide by 2 for radius
    const mass = (4/3) * Math.PI * Math.pow(radius, 3) * 3000; // kg (assuming density 3000 kg/m³)
    const area = Math.PI * radius * radius;
    
    const v0 = entryVelocity * 1000; // m/s
    const angleRad = entryAngle * Math.PI / 180;
    
    // Simulation arrays
    const altitudes = [];
    const velocities = [];
    const pressures = [];
    const forces = [];
    const temperatures = [];
    const machNumbers = [];
    const times = [];
    
    let altitude = ATMOSPHERE_HEIGHT_KM;
    let velocity = v0;
    let currentMass = mass;
    let time = 0;
    const dt = 0.1; // seconds
    
    while (altitude > 0 && velocity > 0 && time < 300) {
      const density = calculateAtmosphericDensity(altitude);
      const dynamicPressure = calculateDynamicPressure(density, velocity);
      const dragForce = calculateDragForce(density, velocity, area);
      
      // Temperature estimation (stagnation temperature)
      // Speed of sound decreases with altitude due to temperature drop
      const speedOfSound = Math.max(MIN_SPEED_OF_SOUND, 340 - (altitude * 0.5));
      const machNumber = velocity / speedOfSound;
      const stagnationTemp = 288 * (1 + 0.2 * machNumber * machNumber);
      
      altitudes.push(altitude);
      velocities.push(velocity / 1000); // km/s
      pressures.push(dynamicPressure / 1e6); // MPa
      forces.push(dragForce / 1e9); // GN
      temperatures.push(Math.min(stagnationTemp, 20000)); // K, capped
      machNumbers.push(machNumber);
      times.push(time);
      
      // Update physics
      const deceleration = dragForce / currentMass;
      velocity -= deceleration * dt;
      altitude -= velocity * Math.sin(angleRad) * dt / 1000;
      
      // Ablation (mass loss due to heating)
      const heatFlux = 0.5 * density * Math.pow(velocity, 3);
      const massLoss = (heatFlux * area * dt) / ABLATION_HEAT;
      currentMass = Math.max(currentMass - massLoss, mass * 0.01);
      
      time += dt;
    }
    
    setCfdData({
      altitudes,
      velocities,
      pressures,
      forces,
      temperatures,
      machNumbers,
      times,
      finalAltitude: altitude,
      finalVelocity: velocity / 1000,
      survivalMass: currentMass / mass * 100,
      peakPressure: Math.max(...pressures),
      peakForce: Math.max(...forces),
      peakTemp: Math.max(...temperatures)
    });
  }, [selectedNeo, entryVelocity, entryAngle, calculateAtmosphericDensity, calculateDynamicPressure, calculateDragForce]);

  // ============================================================================
  // DEM Fragmentation Simulation
  // ============================================================================
  
  const runDEMFragmentation = useCallback(() => {
    if (!selectedNeo || !cfdData) return;
    
    const diameter = selectedNeo.diameter || 0.1;
    const peakPressure = cfdData.peakPressure * 1e6; // Convert back to Pa
    
    // Determine if fragmentation occurs
    const fragmentationThreshold = FRAGMENTATION_STRENGTH;
    const willFragment = peakPressure > fragmentationThreshold;
    
    if (!willFragment) {
      setDemFragments([{
        id: 0,
        x: 0, y: 0, z: 0,
        size: diameter,
        mass: 100,
        velocity: { vx: 0, vy: 0, vz: 0 }
      }]);
      return;
    }
    
    // Calculate number of fragments based on pressure ratio
    // Higher pressure ratio leads to more fragmentation
    const pressureRatio = peakPressure / fragmentationThreshold;
    const numFragments = Math.min(Math.floor(pressureRatio * FRAGMENT_PRESSURE_MULTIPLIER), MAX_FRAGMENTS);
    
    // Generate fragments using DEM-like power law distribution
    // Based on Weibull distribution commonly used in fragmentation models
    const fragments = [];
    let remainingMass = 100; // percentage
    
    // Use seeded random values for reproducibility based on NEO properties
    const seed = (diameter * 1000 + pressureRatio * 100) % 1;
    
    for (let i = 0; i < numFragments; i++) {
      // Power law size distribution with pseudo-random variation
      const randomFactor = 0.3 + ((seed * (i + 1) * 13.7) % 0.2);
      const massPercent = remainingMass * randomFactor;
      remainingMass -= massPercent;
      
      const fragmentSize = diameter * Math.pow(massPercent / 100, 1/3);
      
      // Deterministic dispersion based on fragment index
      const spreadAngle = (i / numFragments) * 2 * Math.PI;
      const spreadVel = 50 + (i * 17) % 200; // m/s
      
      fragments.push({
        id: i,
        x: Math.cos(spreadAngle) * (0.5 + (i % 3) * 0.3),
        y: Math.sin(spreadAngle) * (0.5 + (i % 3) * 0.3),
        z: -i * 0.1,
        size: fragmentSize,
        mass: massPercent,
        velocity: {
          vx: Math.cos(spreadAngle) * spreadVel,
          vy: Math.sin(spreadAngle) * spreadVel,
          vz: -100 - (i * 5) % 50
        }
      });
      
      if (remainingMass < 1) break;
    }
    
    // Add remaining as dust
    if (remainingMass > 0) {
      fragments.push({
        id: numFragments,
        x: 0, y: 0, z: 0,
        size: diameter * 0.01,
        mass: remainingMass,
        velocity: { vx: 0, vy: 0, vz: -50 },
        isDust: true
      });
    }
    
    setDemFragments(fragments);
  }, [selectedNeo, cfdData]);

  // ============================================================================
  // Collision Impact Simulation
  // ============================================================================
  
  const runCollisionSimulation = useCallback(() => {
    if (!selectedNeo) return;
    
    const diameter = selectedNeo.diameter || 0.1; // km
    const velocity = (selectedNeo.relative_velocity || 15) * 1000; // m/s
    const density = 3000; // kg/m³ (stony asteroid)
    const radius = (diameter * 1000) / 2; // Convert km to m, then divide by 2 for radius
    const mass = (4/3) * Math.PI * Math.pow(radius, 3) * density;
    
    // Kinetic energy (Joules)
    const kineticEnergy = 0.5 * mass * velocity * velocity;
    
    // Convert to megatons of TNT (1 MT = 4.184e15 J)
    const energyMT = kineticEnergy / 4.184e15;
    
    // Crater diameter estimation using Pi-scaling model
    // Based on Melosh (1989) Impact Cratering: A Geologic Process
    const craterDiameter = CRATER_SCALING_COEFF * Math.pow(kineticEnergy, CRATER_ENERGY_EXPONENT) * CRATER_KM_CONVERSION;
    
    // Thermal radiation radius (for airburst)
    const thermalRadius = Math.pow(energyMT, 0.41) * 3; // km
    
    // Seismic magnitude approximation using Gutenberg-Richter relation
    const seismicMagnitude = SEISMIC_LOG_COEFF * Math.log10(kineticEnergy) + SEISMIC_OFFSET;
    
    // Atmospheric effects
    const blastRadius = Math.pow(energyMT, 1/3) * 5; // km
    
    setImpactData({
      mass: mass,
      velocity: velocity / 1000,
      kineticEnergy: kineticEnergy,
      energyMT: energyMT,
      craterDiameter: craterDiameter,
      thermalRadius: thermalRadius,
      seismicMagnitude: seismicMagnitude,
      blastRadius: blastRadius,
      destructionLevel: energyMT > 1000 ? 'Extinction Level' :
                       energyMT > 100 ? 'Continental' :
                       energyMT > 10 ? 'Regional' :
                       energyMT > 1 ? 'City-Wide' : 'Local'
    });
  }, [selectedNeo]);

  // ============================================================================
  // Prevention Methods Simulation
  // ============================================================================
  
  const preventionMethods = useMemo(() => [
    {
      id: 'kinetic',
      name: 'Kinetic Impactor',
      icon: '🚀',
      color: '#00d4ff',
      description: 'Direct spacecraft impact to change NEO trajectory. Similar to NASA DART mission.',
      effectiveness: 85,
      leadTime: '5-10 years',
      techReadiness: 9
    },
    {
      id: 'gravity',
      name: 'Gravity Tractor',
      icon: '🌐',
      color: '#9370DB',
      description: 'Spacecraft hovers near NEO, using gravitational pull to slowly alter its course.',
      effectiveness: 60,
      leadTime: '20+ years',
      techReadiness: 6
    },
    {
      id: 'nuclear',
      name: 'Nuclear Standoff',
      icon: '☢️',
      color: '#FF6B6B',
      description: 'Nuclear detonation near NEO surface to vaporize material and create thrust.',
      effectiveness: 95,
      leadTime: '1-5 years',
      techReadiness: 7
    },
    {
      id: 'laser',
      name: 'Laser Ablation',
      icon: '⚡',
      color: '#FFD700',
      description: 'High-powered lasers vaporize surface material, creating propulsive thrust.',
      effectiveness: 70,
      leadTime: '10-15 years',
      techReadiness: 4
    },
    {
      id: 'ion',
      name: 'Ion Beam Deflection',
      icon: '🔋',
      color: '#4ECDC4',
      description: 'Focused ion beam pushes NEO directly, providing continuous thrust.',
      effectiveness: 65,
      leadTime: '15-20 years',
      techReadiness: 5
    }
  ], []);

  // Deflection simulation
  useEffect(() => {
    let interval;
    if (isDeflecting && deflectionProgress < 100) {
      interval = setInterval(() => {
        setDeflectionProgress(prev => {
          if (prev >= 100) {
            setIsDeflecting(false);
            setDetectionStatus('deflected');
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isDeflecting, deflectionProgress]);

  // Entry simulation animation
  useEffect(() => {
    let interval;
    if (isEntrySimulating && cfdData) {
      interval = setInterval(() => {
        setEntrySimulationTime(prev => {
          if (prev >= cfdData.times.length - 1) {
            setIsEntrySimulating(false);
            return cfdData.times.length - 1;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isEntrySimulating, cfdData]);

  // Hazard assessment based on NEO properties
  const hazardAssessment = useMemo(() => {
    if (!selectedNeo) return null;
    
    const distance = selectedNeo.distance || 50000000;
    const diameter = selectedNeo.diameter || 0.1;
    const velocity = selectedNeo.relative_velocity || 15;
    const isHazardous = selectedNeo.is_potentially_hazardous;
    
    // Calculate threat level (0-100)
    const distanceScore = Math.max(0, 100 - (distance / 1000000)); // Closer = higher threat
    const sizeScore = Math.min(100, diameter * 50); // Larger = higher threat
    const velocityScore = Math.min(100, velocity * 3); // Faster = higher threat
    
    const threatLevel = (distanceScore * 0.4 + sizeScore * 0.35 + velocityScore * 0.25);
    
    // Collision probability estimate (simplified)
    const collisionProbability = isHazardous ? 
      Math.min(0.01, 1 / (distance / 1000000)) : 
      Math.min(0.001, 1 / (distance / 10000000));
    
    // Time to impact estimate
    const timeToImpact = distance / (velocity * 1000 * 86400); // days
    
    return {
      threatLevel,
      status: threatLevel > 70 ? 'danger' : threatLevel > 40 ? 'warning' : 'safe',
      collisionProbability,
      timeToImpact,
      distanceScore,
      sizeScore,
      velocityScore
    };
  }, [selectedNeo]);

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
      <Header>🌌 NEO Orbital & Hazard Simulation</Header>
      <Description>
        Comprehensive Near-Earth Object simulation including orbital mechanics, hazard detection,
        atmospheric entry CFD analysis, collision impact modeling, and fragmentation dynamics.
        Select an asteroid and explore various simulation modes.
      </Description>

      {/* Tab Navigation */}
      <TabContainer>
        <Tab active={activeTab === 'orbital'} onClick={() => setActiveTab('orbital')}>
          🌍 Orbital Simulation
        </Tab>
        <Tab active={activeTab === 'hazard'} onClick={() => setActiveTab('hazard')}>
          ⚠️ Hazard Detection
        </Tab>
        <Tab active={activeTab === 'atmospheric'} onClick={() => setActiveTab('atmospheric')}>
          🌡️ Atmospheric Entry
        </Tab>
        <Tab active={activeTab === 'collision'} onClick={() => setActiveTab('collision')}>
          💥 Collision Simulation
        </Tab>
        <Tab active={activeTab === 'fragmentation'} onClick={() => setActiveTab('fragmentation')}>
          🔬 DEM Fragmentation
        </Tab>
      </TabContainer>

      {/* NEO Selection - Visible on all tabs */}
      <ControlPanel>
        <ControlGroup>
          <Label>Select Near-Earth Object</Label>
          <Select 
            value={selectedNeo?.name || ''} 
            onChange={(e) => {
              const neo = data.find(d => d.name === e.target.value);
              setSelectedNeo(neo);
              setDeflectionProgress(0);
              setDetectionStatus('monitoring');
              setCfdData(null);
              setImpactData(null);
              setDemFragments([]);
            }}
          >
            {data.map(neo => (
              <option key={neo.name} value={neo.name}>
                {neo.name} {neo.is_potentially_hazardous ? '⚠️' : ''}
              </option>
            ))}
          </Select>
        </ControlGroup>

        {activeTab === 'orbital' && (
          <>
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
          </>
        )}

        {activeTab === 'atmospheric' && (
          <>
            <ControlGroup>
              <Label>Entry Velocity (km/s)</Label>
              <Input 
                type="number" 
                value={entryVelocity} 
                onChange={(e) => setEntryVelocity(Math.max(5, Math.min(72, Number(e.target.value))))}
                min="5" max="72"
              />
            </ControlGroup>
            <ControlGroup>
              <Label>Entry Angle (°)</Label>
              <Input 
                type="number" 
                value={entryAngle} 
                onChange={(e) => setEntryAngle(Math.max(10, Math.min(90, Number(e.target.value))))}
                min="10" max="90"
              />
            </ControlGroup>
          </>
        )}
      </ControlPanel>

      {/* NEO Info Panel - Visible on all tabs */}
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

      {/* ================================================================== */}
      {/* ORBITAL SIMULATION TAB */}
      {/* ================================================================== */}
      {activeTab === 'orbital' && (
        <>
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
        </>
      )}

      {/* ================================================================== */}
      {/* HAZARD DETECTION & PREVENTION TAB */}
      {/* ================================================================== */}
      {activeTab === 'hazard' && selectedNeo && hazardAssessment && (
        <>
          {/* Threat Assessment */}
          <SectionCard>
            <SectionTitle color="#FF6B6B">🎯 Threat Assessment</SectionTitle>
            
            <AlertBox type={hazardAssessment.status}>
              <div className="icon">
                {hazardAssessment.status === 'danger' ? '🚨' : 
                 hazardAssessment.status === 'warning' ? '⚠️' : '✅'}
              </div>
              <div className="message">
                <strong>{selectedNeo.name}</strong> - Threat Level: {hazardAssessment.threatLevel.toFixed(1)}%
                {hazardAssessment.status === 'danger' && ' - IMMEDIATE ATTENTION REQUIRED'}
                {hazardAssessment.status === 'warning' && ' - Continued monitoring recommended'}
                {hazardAssessment.status === 'safe' && ' - Low risk, standard monitoring'}
              </div>
              <StatusBadge status={hazardAssessment.status}>
                {hazardAssessment.status.toUpperCase()}
              </StatusBadge>
            </AlertBox>

            <SimulationGrid>
              <MetricCard gradient="rgba(255,68,68,0.2), rgba(255,68,68,0.05)" 
                          borderColor="rgba(255, 68, 68, 0.3)" valueColor="#FF6B6B">
                <div className="icon">🎯</div>
                <div className="value">{hazardAssessment.threatLevel.toFixed(1)}<span className="unit">%</span></div>
                <div className="label">Overall Threat Level</div>
                <ProgressBar value={hazardAssessment.threatLevel} color="linear-gradient(90deg, #00FF88, #FFD700, #FF4444)" />
              </MetricCard>

              <MetricCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)"
                          borderColor="rgba(255, 215, 0, 0.3)" valueColor="#FFD700">
                <div className="icon">📏</div>
                <div className="value">{(selectedNeo.distance / 1e6).toFixed(2)}<span className="unit">M km</span></div>
                <div className="label">Current Distance</div>
              </MetricCard>

              <MetricCard gradient="rgba(78,205,196,0.2), rgba(78,205,196,0.05)"
                          borderColor="rgba(78, 205, 196, 0.3)" valueColor="#4ECDC4">
                <div className="icon">⏱️</div>
                <div className="value">{hazardAssessment.timeToImpact.toFixed(0)}<span className="unit">days</span></div>
                <div className="label">Est. Time to Closest Approach</div>
              </MetricCard>

              <MetricCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)"
                          borderColor="rgba(147, 112, 219, 0.3)" valueColor="#9370DB">
                <div className="icon">🎲</div>
                <div className="value">{(hazardAssessment.collisionProbability * 100).toExponential(2)}<span className="unit">%</span></div>
                <div className="label">Collision Probability</div>
              </MetricCard>
            </SimulationGrid>
          </SectionCard>

          {/* Prevention Methods */}
          <SectionCard>
            <SectionTitle color="#00d4ff">🛡️ Prevention Measures</SectionTitle>
            
            <SimulationGrid>
              {preventionMethods.map(method => (
                <PreventionMethodCard 
                  key={method.id}
                  selected={selectedPreventionMethod === method.id}
                  color={method.color}
                  onClick={() => setSelectedPreventionMethod(method.id)}
                >
                  <h4>
                    <span>{method.icon}</span>
                    {method.name}
                  </h4>
                  <p>{method.description}</p>
                  <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: method.color }}>Effectiveness: {method.effectiveness}%</span>
                    <span style={{ color: '#888' }}>TRL: {method.techReadiness}/9</span>
                  </div>
                  <ProgressBar value={method.effectiveness} color={method.color} />
                </PreventionMethodCard>
              ))}
            </SimulationGrid>

            {/* Deflection Simulation */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h4 style={{ color: '#ccc', marginBottom: '15px' }}>
                Deploy {preventionMethods.find(m => m.id === selectedPreventionMethod)?.name} Mission
              </h4>
              
              {detectionStatus === 'deflected' ? (
                <AlertBox type="safe">
                  <div className="icon">✅</div>
                  <div className="message">
                    <strong>Deflection Successful!</strong> - {selectedNeo.name} trajectory has been altered.
                    The NEO will now safely pass Earth.
                  </div>
                </AlertBox>
              ) : (
                <>
                  <ProgressBar value={deflectionProgress} color="linear-gradient(90deg, #00d4ff, #00FF88)" />
                  <p style={{ color: '#888', marginBottom: '15px' }}>
                    Mission Progress: {deflectionProgress}%
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <SuccessButton 
                      onClick={() => {
                        setIsDeflecting(true);
                        setDetectionStatus('deflecting');
                      }}
                      disabled={isDeflecting || deflectionProgress >= 100}
                    >
                      🚀 Deploy Mission
                    </SuccessButton>
                    <Button onClick={() => {
                      setDeflectionProgress(0);
                      setIsDeflecting(false);
                      setDetectionStatus('monitoring');
                    }}>
                      🔄 Reset Simulation
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </>
      )}

      {/* ================================================================== */}
      {/* ATMOSPHERIC ENTRY CFD TAB */}
      {/* ================================================================== */}
      {activeTab === 'atmospheric' && selectedNeo && (
        <>
          <SectionCard>
            <SectionTitle color="#FF6B6B">🌡️ CFD Atmospheric Entry Simulation</SectionTitle>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#888', marginBottom: '15px' }}>
                Simulate atmospheric entry physics including pressure, velocity, force, and temperature changes
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Button onClick={() => {
                  runCFDSimulation();
                  setEntrySimulationTime(0);
                }}>
                  🔬 Run CFD Simulation
                </Button>
                {cfdData && (
                  <Button onClick={() => {
                    setIsEntrySimulating(!isEntrySimulating);
                    if (!isEntrySimulating) setEntrySimulationTime(0);
                  }}>
                    {isEntrySimulating ? '⏸ Pause' : '▶ Animate Entry'}
                  </Button>
                )}
              </div>
            </div>

            {cfdData && (
              <>
                {/* Summary Metrics */}
                <SimulationGrid>
                  <MetricCard gradient="rgba(255,68,68,0.2), rgba(255,68,68,0.05)"
                              borderColor="rgba(255, 68, 68, 0.3)" valueColor="#FF6B6B">
                    <div className="icon">🔥</div>
                    <div className="value">{cfdData.peakTemp.toFixed(0)}<span className="unit">K</span></div>
                    <div className="label">Peak Temperature</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)"
                              borderColor="rgba(255, 215, 0, 0.3)" valueColor="#FFD700">
                    <div className="icon">📊</div>
                    <div className="value">{cfdData.peakPressure.toFixed(2)}<span className="unit">MPa</span></div>
                    <div className="label">Peak Dynamic Pressure</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(78,205,196,0.2), rgba(78,205,196,0.05)"
                              borderColor="rgba(78, 205, 196, 0.3)" valueColor="#4ECDC4">
                    <div className="icon">💪</div>
                    <div className="value">{cfdData.peakForce.toFixed(2)}<span className="unit">GN</span></div>
                    <div className="label">Peak Drag Force</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)"
                              borderColor="rgba(147, 112, 219, 0.3)" valueColor="#9370DB">
                    <div className="icon">⚖️</div>
                    <div className="value">{cfdData.survivalMass.toFixed(1)}<span className="unit">%</span></div>
                    <div className="label">Mass Survival Rate</div>
                  </MetricCard>
                </SimulationGrid>

                {/* CFD Charts */}
                <SimulationGrid style={{ marginTop: '20px' }}>
                  <Plot
                    data={[{
                      type: 'scatter',
                      mode: 'lines',
                      x: cfdData.altitudes.slice(0, entrySimulationTime || cfdData.altitudes.length),
                      y: cfdData.velocities.slice(0, entrySimulationTime || cfdData.velocities.length),
                      line: { color: '#00d4ff', width: 3 },
                      name: 'Velocity'
                    }]}
                    layout={{
                      title: { text: 'Velocity vs Altitude', font: { color: '#00d4ff', size: 14 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Altitude (km)', color: '#666', gridcolor: '#333', autorange: 'reversed' },
                      yaxis: { title: 'Velocity (km/s)', color: '#666', gridcolor: '#333' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', height: '300px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                  <Plot
                    data={[{
                      type: 'scatter',
                      mode: 'lines',
                      x: cfdData.altitudes.slice(0, entrySimulationTime || cfdData.altitudes.length),
                      y: cfdData.pressures.slice(0, entrySimulationTime || cfdData.pressures.length),
                      line: { color: '#FFD700', width: 3 },
                      name: 'Pressure'
                    }]}
                    layout={{
                      title: { text: 'Dynamic Pressure vs Altitude', font: { color: '#FFD700', size: 14 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Altitude (km)', color: '#666', gridcolor: '#333', autorange: 'reversed' },
                      yaxis: { title: 'Pressure (MPa)', color: '#666', gridcolor: '#333' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', height: '300px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                </SimulationGrid>

                <SimulationGrid>
                  <Plot
                    data={[{
                      type: 'scatter',
                      mode: 'lines',
                      x: cfdData.altitudes.slice(0, entrySimulationTime || cfdData.altitudes.length),
                      y: cfdData.forces.slice(0, entrySimulationTime || cfdData.forces.length),
                      line: { color: '#4ECDC4', width: 3 },
                      name: 'Force'
                    }]}
                    layout={{
                      title: { text: 'Drag Force vs Altitude', font: { color: '#4ECDC4', size: 14 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Altitude (km)', color: '#666', gridcolor: '#333', autorange: 'reversed' },
                      yaxis: { title: 'Force (GN)', color: '#666', gridcolor: '#333' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', height: '300px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                  <Plot
                    data={[{
                      type: 'scatter',
                      mode: 'lines',
                      x: cfdData.altitudes.slice(0, entrySimulationTime || cfdData.altitudes.length),
                      y: cfdData.temperatures.slice(0, entrySimulationTime || cfdData.temperatures.length),
                      line: { color: '#FF6B6B', width: 3 },
                      name: 'Temperature'
                    }]}
                    layout={{
                      title: { text: 'Stagnation Temperature vs Altitude', font: { color: '#FF6B6B', size: 14 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Altitude (km)', color: '#666', gridcolor: '#333', autorange: 'reversed' },
                      yaxis: { title: 'Temperature (K)', color: '#666', gridcolor: '#333' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', height: '300px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                </SimulationGrid>
              </>
            )}
          </SectionCard>
        </>
      )}

      {/* ================================================================== */}
      {/* COLLISION SIMULATION TAB */}
      {/* ================================================================== */}
      {activeTab === 'collision' && selectedNeo && (
        <>
          <SectionCard>
            <SectionTitle color="#FF4444">💥 NEO Collision Impact Simulation</SectionTitle>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#888', marginBottom: '15px' }}>
                Simulate the effects of a direct impact with Earth, including energy release and destruction radius
              </p>
              <DangerButton onClick={runCollisionSimulation}>
                💥 Simulate Impact
              </DangerButton>
            </div>

            {impactData && (
              <>
                <AlertBox type={impactData.energyMT > 100 ? 'danger' : impactData.energyMT > 10 ? 'warning' : 'safe'}>
                  <div className="icon">
                    {impactData.energyMT > 100 ? '🌋' : impactData.energyMT > 10 ? '💥' : '☄️'}
                  </div>
                  <div className="message">
                    <strong>Impact Classification: {impactData.destructionLevel}</strong><br />
                    Energy Release: {impactData.energyMT.toExponential(2)} Megatons TNT equivalent
                  </div>
                </AlertBox>

                <SimulationGrid>
                  <MetricCard gradient="rgba(255,68,68,0.2), rgba(255,68,68,0.05)"
                              borderColor="rgba(255, 68, 68, 0.3)" valueColor="#FF6B6B">
                    <div className="icon">💣</div>
                    <div className="value">{impactData.energyMT.toExponential(2)}<span className="unit">MT</span></div>
                    <div className="label">Energy Release (TNT)</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(255,165,0,0.2), rgba(255,165,0,0.05)"
                              borderColor="rgba(255, 165, 0, 0.3)" valueColor="#FFA500">
                    <div className="icon">🕳️</div>
                    <div className="value">{impactData.craterDiameter.toFixed(2)}<span className="unit">km</span></div>
                    <div className="label">Crater Diameter</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)"
                              borderColor="rgba(255, 215, 0, 0.3)" valueColor="#FFD700">
                    <div className="icon">🔥</div>
                    <div className="value">{impactData.thermalRadius.toFixed(1)}<span className="unit">km</span></div>
                    <div className="label">Thermal Radiation Radius</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)"
                              borderColor="rgba(147, 112, 219, 0.3)" valueColor="#9370DB">
                    <div className="icon">💨</div>
                    <div className="value">{impactData.blastRadius.toFixed(1)}<span className="unit">km</span></div>
                    <div className="label">Air Blast Radius</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(78,205,196,0.2), rgba(78,205,196,0.05)"
                              borderColor="rgba(78, 205, 196, 0.3)" valueColor="#4ECDC4">
                    <div className="icon">📊</div>
                    <div className="value">{impactData.seismicMagnitude.toFixed(1)}<span className="unit">M</span></div>
                    <div className="label">Seismic Magnitude</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(0,212,255,0.2), rgba(0,212,255,0.05)"
                              borderColor="rgba(0, 212, 255, 0.3)" valueColor="#00d4ff">
                    <div className="icon">🚀</div>
                    <div className="value">{impactData.velocity.toFixed(1)}<span className="unit">km/s</span></div>
                    <div className="label">Impact Velocity</div>
                  </MetricCard>
                </SimulationGrid>

                {/* Impact visualization */}
                <div style={{ marginTop: '30px' }}>
                  <Plot
                    data={[
                      // Crater
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: Array.from({length: 100}, (_, i) => Math.cos(i * 2 * Math.PI / 100) * impactData.craterDiameter / 2),
                        y: Array.from({length: 100}, (_, i) => Math.sin(i * 2 * Math.PI / 100) * impactData.craterDiameter / 2),
                        line: { color: '#8B4513', width: 3 },
                        fill: 'toself',
                        fillcolor: 'rgba(139, 69, 19, 0.3)',
                        name: 'Crater'
                      },
                      // Thermal radius
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: Array.from({length: 100}, (_, i) => Math.cos(i * 2 * Math.PI / 100) * impactData.thermalRadius),
                        y: Array.from({length: 100}, (_, i) => Math.sin(i * 2 * Math.PI / 100) * impactData.thermalRadius),
                        line: { color: '#FF4444', width: 2, dash: 'dash' },
                        name: 'Thermal Radius'
                      },
                      // Blast radius
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: Array.from({length: 100}, (_, i) => Math.cos(i * 2 * Math.PI / 100) * impactData.blastRadius),
                        y: Array.from({length: 100}, (_, i) => Math.sin(i * 2 * Math.PI / 100) * impactData.blastRadius),
                        line: { color: '#FFD700', width: 2, dash: 'dot' },
                        name: 'Blast Radius'
                      }
                    ]}
                    layout={{
                      title: { text: 'Impact Zone Visualization', font: { color: '#00d4ff', size: 16 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Distance (km)', color: '#666', gridcolor: '#333', scaleanchor: 'y' },
                      yaxis: { title: 'Distance (km)', color: '#666', gridcolor: '#333' },
                      showlegend: true,
                      legend: { font: { color: '#ccc' }, bgcolor: 'rgba(0,0,0,0.5)' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', maxWidth: '700px', height: '500px', margin: '0 auto' }}
                    config={{ responsive: true, displayModeBar: true }}
                  />
                </div>
              </>
            )}
          </SectionCard>
        </>
      )}

      {/* ================================================================== */}
      {/* DEM FRAGMENTATION TAB */}
      {/* ================================================================== */}
      {activeTab === 'fragmentation' && selectedNeo && (
        <>
          <SectionCard>
            <SectionTitle color="#9370DB">🔬 DEM Fragmentation Analysis</SectionTitle>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#888', marginBottom: '15px' }}>
                Discrete Element Method (DEM) simulation of NEO breakup during atmospheric entry.
                First run the CFD simulation to determine fragmentation conditions.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={() => {
                  runCFDSimulation();
                }}>
                  🔬 Run CFD Analysis
                </Button>
                <Button onClick={runDEMFragmentation} disabled={!cfdData}>
                  💎 Run DEM Fragmentation
                </Button>
                {demFragments.length > 0 && (
                  <Button onClick={() => setFragmentationActive(!fragmentationActive)}>
                    {fragmentationActive ? '⏸ Pause' : '▶ Animate'}
                  </Button>
                )}
              </div>
            </div>

            {cfdData && (
              <AlertBox type={cfdData.peakPressure * 1e6 > FRAGMENTATION_STRENGTH ? 'warning' : 'safe'}>
                <div className="icon">
                  {cfdData.peakPressure * 1e6 > FRAGMENTATION_STRENGTH ? '💥' : '🛡️'}
                </div>
                <div className="message">
                  <strong>Peak Dynamic Pressure: {cfdData.peakPressure.toFixed(2)} MPa</strong><br />
                  Fragmentation Threshold: {(FRAGMENTATION_STRENGTH / 1e6).toFixed(2)} MPa
                  {cfdData.peakPressure * 1e6 > FRAGMENTATION_STRENGTH ? 
                    ' - NEO WILL FRAGMENT during atmospheric entry' : 
                    ' - NEO will remain intact'}
                </div>
              </AlertBox>
            )}

            {demFragments.length > 0 && (
              <>
                <SimulationGrid>
                  <MetricCard gradient="rgba(147,112,219,0.2), rgba(147,112,219,0.05)"
                              borderColor="rgba(147, 112, 219, 0.3)" valueColor="#9370DB">
                    <div className="icon">💎</div>
                    <div className="value">{demFragments.length}</div>
                    <div className="label">Total Fragments</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(78,205,196,0.2), rgba(78,205,196,0.05)"
                              borderColor="rgba(78, 205, 196, 0.3)" valueColor="#4ECDC4">
                    <div className="icon">🔷</div>
                    <div className="value">{demFragments.filter(f => !f.isDust).length}</div>
                    <div className="label">Major Fragments</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(255,215,0,0.2), rgba(255,215,0,0.05)"
                              borderColor="rgba(255, 215, 0, 0.3)" valueColor="#FFD700">
                    <div className="icon">📏</div>
                    <div className="value">{Math.max(...demFragments.map(f => f.size)).toFixed(3)}<span className="unit">km</span></div>
                    <div className="label">Largest Fragment</div>
                  </MetricCard>
                  <MetricCard gradient="rgba(255,68,68,0.2), rgba(255,68,68,0.05)"
                              borderColor="rgba(255, 68, 68, 0.3)" valueColor="#FF6B6B">
                    <div className="icon">🌫️</div>
                    <div className="value">{demFragments.filter(f => f.isDust).reduce((sum, f) => sum + f.mass, 0).toFixed(1)}<span className="unit">%</span></div>
                    <div className="label">Dust/Ablation Loss</div>
                  </MetricCard>
                </SimulationGrid>

                {/* 3D Fragment Visualization */}
                <div style={{ marginTop: '30px' }}>
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: demFragments.map(f => f.x),
                        y: demFragments.map(f => f.y),
                        z: demFragments.map(f => f.z),
                        marker: {
                          size: demFragments.map(f => Math.max(5, f.size * 50)),
                          color: demFragments.map(f => f.mass),
                          colorscale: 'Viridis',
                          showscale: true,
                          colorbar: {
                            title: { text: 'Mass %', font: { color: '#ccc' } },
                            tickfont: { color: '#ccc' }
                          },
                          line: { width: 1, color: '#fff' }
                        },
                        text: demFragments.map(f => 
                          `Fragment ${f.id}<br>Size: ${f.size.toFixed(4)} km<br>Mass: ${f.mass.toFixed(1)}%`
                        ),
                        hovertemplate: '%{text}<extra></extra>',
                        name: 'Fragments'
                      }
                    ]}
                    layout={{
                      title: { text: '3D Fragment Distribution', font: { color: '#9370DB', size: 16 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      scene: {
                        xaxis: { title: 'X (relative)', color: '#666', gridcolor: '#333' },
                        yaxis: { title: 'Y (relative)', color: '#666', gridcolor: '#333' },
                        zaxis: { title: 'Altitude (relative)', color: '#666', gridcolor: '#333' },
                        bgcolor: 'rgba(10, 10, 30, 0.8)',
                        aspectmode: 'cube',
                        camera: { eye: { x: 1.5, y: 1.5, z: 1 } }
                      },
                      showlegend: false,
                      margin: { t: 50, b: 0, l: 0, r: 0 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', maxWidth: '800px', height: '500px', margin: '0 auto' }}
                    config={{ responsive: true, displayModeBar: true }}
                  />
                </div>

                {/* Fragment Size Distribution */}
                <div style={{ marginTop: '20px' }}>
                  <Plot
                    data={[{
                      type: 'bar',
                      x: demFragments.filter(f => !f.isDust).map((_, i) => `Frag ${i + 1}`),
                      y: demFragments.filter(f => !f.isDust).map(f => f.mass),
                      marker: {
                        color: demFragments.filter(f => !f.isDust).map(f => f.size),
                        colorscale: 'Plasma',
                        showscale: true,
                        colorbar: {
                          title: { text: 'Size (km)', font: { color: '#ccc' } },
                          tickfont: { color: '#ccc' }
                        }
                      },
                      name: 'Mass Distribution'
                    }]}
                    layout={{
                      title: { text: 'Fragment Mass Distribution', font: { color: '#4ECDC4', size: 16 } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(10,10,30,0.8)',
                      xaxis: { title: 'Fragment', color: '#666', gridcolor: '#333' },
                      yaxis: { title: 'Mass (%)', color: '#666', gridcolor: '#333' },
                      margin: { t: 50, b: 50, l: 60, r: 30 },
                      font: { color: '#ccc' }
                    }}
                    style={{ width: '100%', maxWidth: '800px', height: '350px', margin: '0 auto' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                </div>
              </>
            )}
          </SectionCard>
        </>
      )}
    </PageContainer>
  );
};

export default OrbitalSimulation;
