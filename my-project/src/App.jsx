import React, { Component } from 'react';
import './App.css';
import USAMap from "react-usa-map";
import stateData from './h100_emissions.json'
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

class App extends Component {

  componentDidMount() {
    
    document.querySelectorAll('path[title]').forEach(el => el.removeAttribute('title'));
  
    // Add tooltip data to each path based on stateData
    document.querySelectorAll('path[data-name]').forEach(el => {
      const state = el.dataset.name;
      const co2 = stateData[state]?.['Average H100 Annual CO2 Emission (tons)'];
      const co2perMWh = stateData[state]?.['Average CO2/MWh'];
      const num_trees = stateData[state]?.['Estimated Trees to Offset H100 CO2']
    
      if (co2 && co2perMWh) {
        el.setAttribute('data-tooltip-id', 'tooltip');
        el.setAttribute(
          'data-tooltip-html',
          `<b>${state}</b><br/>
           H100 CO₂: ${co2.toFixed(2)} tons<br/><br/>
           Avg CO₂/MWh per plant: ${co2perMWh.toFixed(2)} <br/><br/>
           Number of 🌲 needed to offset h100 CO₂: ${num_trees}`
        );
      }
    });
  }
  
  state_fill_color = (stateData, state) => {
    const co2_emission = stateData[state]?.['Average H100 Annual CO2 Emission (tons)'];
  
    if (co2_emission == null) return '#d1d5db'; // fallback gray
  
    let fill_color;
  
    if (co2_emission <= 2) {
      fill_color = '#065f46'; // dark green
    } else if (co2_emission <= 3) {
      fill_color = '#0aa177'; // light green
    } else if (co2_emission <= 4) {
      fill_color = '#facc15'; // yellow
    } else if (co2_emission <= 6) {
      fill_color = '#f97316'; // orange
    } else {
      fill_color = '#dc2626'; // red
    }
  
    return fill_color;
  };

  generateMapCustomization = () => {
    const customization = {};
  
    for (const state in stateData) {
      customization[state] = {
        fill: this.state_fill_color(stateData, state),
        clickHandler: () => this.mapHandler({ target: { dataset: { name: state } } })
        // ❌ remove mouseOverHandler/mouseOutHandler — they don't work
      };
    }
  
    return customization;
  };
  mapHandler = (event) => {
    alert(event.target.dataset.name);
  };

  render() {
    const gradient = [
      { color: '#065f46', label: '0' },   // dark green
      { color: '#0aa177', label: '2' },
      { color: '#facc15', label: '4' },
      { color: '#f97316', label: '6' },
      { color: '#dc2626', label: '8+' }   // red
    ];
  
    return (
      <div className='w-full min-h-screen bg-gray-300 overflow-y-auto'>
        <div className='flex flex-col items-center py-8 px-4'>
          <h1 className='text-black text-2xl font-bold text-center px-4 mb-8'>
            Estimated Annual CO₂ Output of H100 GPU per Power Plant
          </h1>
    
          {/* ✅ Wrap map and gradient together */}
          <div className="flex flex-col items-center">
            <USAMap onClick={this.mapHandler} customize={this.generateMapCustomization()} />
            <ReactTooltip id='tooltip' multiline={true} />
    
            <div className="w-full max-w-md mt-6 flex justify-end">
              <div className="flex flex-col w-3/4">
                {/* Gradient bar */}
                <div
                  className="h-4 rounded"
                  style={{
                    background: `linear-gradient(to right, ${gradient.map(g => g.color).join(', ')})`,
                  }}
                />

                {/* Gradient labels */}
                <div className="flex justify-between text-xs text-black mt-1 px-1">
                  {gradient.map((g, i) => (
                    <span key={i}>{g.label}</span>
                  ))}
                </div>

                {/* Caption text */}
                <div className="flex justify-end px-1 mt-1">
                  <p className="text-xs text-right">
                    Estimated annual CO₂ emitted to power an H100 GPU at full power (tons)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;