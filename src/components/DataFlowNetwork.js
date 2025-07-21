import React, { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { initializeDataFlowNetwork } from '../utils/dataFlowNetwork';

function DataFlowNetwork() {
  const canvasRef = useRef();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    let cleanup;
    
    // Get theme-appropriate colors
    const themeColors = {
      primary: theme === 'dark' ? '#a64dff' : '#8622c9',
      secondary: '#3222c9',
      accent: theme === 'dark' ? '#a64dff' : '#8622c9'
    };
    
    if (canvasRef.current) {
      cleanup = initializeDataFlowNetwork(canvasRef, themeColors);
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="data-flow-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}

export default DataFlowNetwork;