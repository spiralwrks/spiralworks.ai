import * as THREE from 'three';

const objectPool = {
  nodeGeometry: null,
  nodeMaterial: null,
  nodes: null,
  connectionGeometry: null,
  connectionMaterial: null,
  connections: null,
  flowGeometry: null,
  flowMaterial: null,
  flowParticles: null,
};

export const initializeDataFlowNetwork = (canvasRef, themeColors = null) => {
  if (!canvasRef.current) {
    console.error('No canvas ref provided for WebGL');
    return;
  }

  const canvas = canvasRef.current;
  console.log('Canvas element:', canvas);
  console.log('Canvas dimensions:', canvas.clientWidth, canvas.clientHeight);
  
  const scene = new THREE.Scene();

  const isMobile = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Get theme colors or use defaults
  const getThemeColors = () => {
    if (themeColors) return themeColors;
    
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      primary: isDarkMode ? '#a64dff' : '#8622c9',
      secondary: '#3222c9',
      accent: isDarkMode ? '#a64dff' : '#8622c9'
    };
  };

  let currentThemeColors = getThemeColors();

  const parameters = {
    nodeCount: isMobile ? 600 : 1200,
    flowParticleCount: isMobile ? 2000 : 4000,
    nodeSize: isMobile ? 0.006 : 0.008,
    flowParticleSize: isMobile ? 0.003 : 0.004,
    networkRadius: isMobile ? 1.4 : 1.3,
    connectionOpacity: 0.12,
    flowSpeed: 0.2,
    primaryColor: currentThemeColors.primary,
    secondaryColor: currentThemeColors.secondary,
    accentColor: currentThemeColors.accent
  };

  // Network topology data
  let networkNodes = [];
  let connections = [];
  let flowParticles = [];

  const generateNetwork = () => {
    // Clear existing objects safely
    if (objectPool.nodes) {
      scene.remove(objectPool.nodes);
      if (objectPool.nodeGeometry) objectPool.nodeGeometry.dispose();
      if (objectPool.nodeMaterial) objectPool.nodeMaterial.dispose();
    }
    if (objectPool.connections) {
      scene.remove(objectPool.connections);
      if (objectPool.connectionGeometry) objectPool.connectionGeometry.dispose();
      if (objectPool.connectionMaterial) objectPool.connectionMaterial.dispose();
    }
    if (objectPool.flowParticles) {
      scene.remove(objectPool.flowParticles);
      if (objectPool.flowGeometry) objectPool.flowGeometry.dispose();
      if (objectPool.flowMaterial) objectPool.flowMaterial.dispose();
    }

    // Generate ultra-dense fractal neural structure
    networkNodes = [];
    
    // Create multiple interconnected structures
    const structures = [
      // Central dense core with fibonacci spiral
      { count: Math.floor(parameters.nodeCount * 0.4), type: 'core', radius: 0.3 },
      // Branching neural dendrites 
      { count: Math.floor(parameters.nodeCount * 0.3), type: 'dendrites', radius: 0.6 },
      // Outer connecting web
      { count: Math.floor(parameters.nodeCount * 0.3), type: 'web', radius: 1.0 }
    ];
    
    structures.forEach(struct => {
      for (let i = 0; i < struct.count; i++) {
        let x, y, z, nodeType;
        
        if (struct.type === 'core') {
          // Dense fibonacci spiral core
          const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0));
          const normalizedIndex = i / struct.count;
          const radius = Math.pow(normalizedIndex, 0.7) * parameters.networkRadius * struct.radius;
          const phi = i * goldenAngle;
          const theta = Math.acos(1 - 2 * normalizedIndex);
          
          x = radius * Math.cos(phi) * Math.sin(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(theta);
          nodeType = 'core';
          
        } else if (struct.type === 'dendrites') {
          // Branching dendrite-like structures
          const branchCount = 8;
          const branchIndex = i % branchCount;
          const nodeInBranch = Math.floor(i / branchCount);
          const branchProgress = nodeInBranch / Math.floor(struct.count / branchCount);
          
          // Create branching pattern
          const branchAngle = (branchIndex / branchCount) * Math.PI * 2;
          const branchRadius = branchProgress * parameters.networkRadius * struct.radius;
          
          // Add fractal branching
          const subBranchAngle = branchAngle + Math.sin(branchProgress * 8) * 0.5;
          const heightVariation = Math.sin(branchProgress * 6) * 0.3;
          
          x = branchRadius * Math.cos(subBranchAngle);
          y = branchRadius * Math.sin(subBranchAngle) + heightVariation;
          z = (Math.random() - 0.5) * branchRadius * 0.6;
          nodeType = 'dendrite';
          
        } else {
          // Outer web connections - more sparse
          const radius = (Math.random() * 0.4 + 0.6) * parameters.networkRadius * struct.radius;
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.acos(1 - 2 * Math.random());
          
          x = radius * Math.cos(phi) * Math.sin(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(theta);
          nodeType = 'web';
        }
        
        // Add noise for organic variation
        const noise = 0.05;
        x += (Math.random() - 0.5) * noise;
        y += (Math.random() - 0.5) * noise;
        z += (Math.random() - 0.5) * noise;
        
        networkNodes.push({
          position: new THREE.Vector3(x, y, z),
          connections: [],
          activity: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
          nodeType: nodeType,
          structureIndex: structures.indexOf(struct)
        });
      }
    });

    // Create very dense mesh-like connections
    connections = [];
    for (let i = 0; i < networkNodes.length; i++) {
      const node1 = networkNodes[i];
      
      // Connect each node to its nearest neighbors
      const distances = [];
      for (let j = 0; j < networkNodes.length; j++) {
        if (i !== j) {
          const distance = node1.position.distanceTo(networkNodes[j].position);
          distances.push({ index: j, distance: distance, node: networkNodes[j] });
        }
      }
      
      // Sort by distance and connect to nearest neighbors
      distances.sort((a, b) => a.distance - b.distance);
      
      // Dense connections for web effect while staying optimized
      let maxConnections;
      if (node1.nodeType === 'core') {
        maxConnections = isMobile ? 15 : 25; // Dense core connections
      } else if (node1.nodeType === 'dendrite') {
        maxConnections = isMobile ? 10 : 18; // Dense dendrite connections 
      } else {
        maxConnections = isMobile ? 6 : 10; // Web connections
      }
      
      for (let k = 0; k < Math.min(maxConnections, distances.length); k++) {
        const neighbor = distances[k];
        
        // Higher connection probability for denser web
        if (Math.random() > 0.1 && neighbor.distance < parameters.networkRadius * 0.6) {
          // Avoid duplicate connections
          const alreadyConnected = connections.some(conn => 
            (conn.from === i && conn.to === neighbor.index) ||
            (conn.from === neighbor.index && conn.to === i)
          );
          
          if (!alreadyConnected) {
            connections.push({
              from: i,
              to: neighbor.index,
              strength: Math.max(0.3, 1.0 - (neighbor.distance / parameters.networkRadius)),
              layer: node1.layer
            });
            node1.connections.push(neighbor.index);
            neighbor.node.connections.push(i);
          }
        }
      }
    }

    // Create optimized nodes using Points for better performance
    const nodePositions = new Float32Array(networkNodes.length * 3);
    const nodeColors = new Float32Array(networkNodes.length * 3);
    
    const primaryColorObj = new THREE.Color(parameters.primaryColor);
    const accentColorObj = new THREE.Color(parameters.accentColor);
    const secondaryColorObj = new THREE.Color(parameters.secondaryColor);
    
    networkNodes.forEach((node, index) => {
      nodePositions[index * 3] = node.position.x;
      nodePositions[index * 3 + 1] = node.position.y;
      nodePositions[index * 3 + 2] = node.position.z;
      
      let color = primaryColorObj.clone();
      if (node.nodeType === 'core') {
        color.lerp(accentColorObj, 0.3);
      } else if (node.nodeType === 'dendrite') {
        color.lerp(secondaryColorObj, 0.4);
      } else {
        color.lerp(accentColorObj, Math.random() * 0.5);
      }
      
      nodeColors[index * 3] = color.r;
      nodeColors[index * 3 + 1] = color.g;
      nodeColors[index * 3 + 2] = color.b;
    });
    
    objectPool.nodeGeometry = new THREE.BufferGeometry();
    objectPool.nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    objectPool.nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    
    objectPool.nodeMaterial = new THREE.PointsMaterial({
      size: parameters.nodeSize * 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3, // Much more subtle nodes
      vertexColors: true,
      blending: THREE.AdditiveBlending // Soft glow instead of solid squares
    });
    
    objectPool.nodes = new THREE.Points(objectPool.nodeGeometry, objectPool.nodeMaterial);
    scene.add(objectPool.nodes);

    // Create connection lines
    const connectionGeometry = new THREE.BufferGeometry();
    const connectionPositions = new Float32Array(connections.length * 6);
    const connectionColors = new Float32Array(connections.length * 6);

    const connectionPrimaryColor = new THREE.Color(parameters.primaryColor);
    const connectionSecondaryColor = new THREE.Color(parameters.secondaryColor);

    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      const fromPos = networkNodes[connection.from].position;
      const toPos = networkNodes[connection.to].position;
      
      // Line positions
      connectionPositions[i * 6] = fromPos.x;
      connectionPositions[i * 6 + 1] = fromPos.y;
      connectionPositions[i * 6 + 2] = fromPos.z;
      connectionPositions[i * 6 + 3] = toPos.x;
      connectionPositions[i * 6 + 4] = toPos.y;
      connectionPositions[i * 6 + 5] = toPos.z;

      // Gradient line colors for silky effect
      const gradient = Math.random();
      const color = connectionPrimaryColor.clone().lerp(connectionSecondaryColor, gradient * 0.7);
      
      // Add some brightness variation for silk-like shimmer
      const brightness = 0.7 + Math.random() * 0.3;
      color.multiplyScalar(brightness);
      connectionColors[i * 6] = color.r;
      connectionColors[i * 6 + 1] = color.g;
      connectionColors[i * 6 + 2] = color.b;
      connectionColors[i * 6 + 3] = color.r;
      connectionColors[i * 6 + 4] = color.g;
      connectionColors[i * 6 + 5] = color.b;
    }

    connectionGeometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3));
    connectionGeometry.setAttribute('color', new THREE.BufferAttribute(connectionColors, 3));

    objectPool.connectionMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: parameters.connectionOpacity * 1.5, // Brighter connections
      blending: THREE.AdditiveBlending, // Silky glow effect
      linewidth: 1 // Thin, elegant lines
    });

    objectPool.connections = new THREE.LineSegments(connectionGeometry, objectPool.connectionMaterial);
    scene.add(objectPool.connections);

    // Create flowing particles
    objectPool.flowGeometry = new THREE.BufferGeometry();
    const flowPositions = new Float32Array(parameters.flowParticleCount * 3);
    const flowColors = new Float32Array(parameters.flowParticleCount * 3);

    flowParticles = [];
    
    for (let i = 0; i < parameters.flowParticleCount; i++) {
      if (connections.length === 0) break;
      
      const connection = connections[Math.floor(Math.random() * connections.length)];
      const progress = Math.random();
      const fromPos = networkNodes[connection.from].position;
      const toPos = networkNodes[connection.to].position;
      
      const currentPos = fromPos.clone().lerp(toPos, progress);
      
      flowPositions[i * 3] = currentPos.x;
      flowPositions[i * 3 + 1] = currentPos.y;
      flowPositions[i * 3 + 2] = currentPos.z;

      const color = new THREE.Color().lerpColors(
        new THREE.Color(parameters.primaryColor),
        new THREE.Color(parameters.secondaryColor),
        Math.random()
      );
      
      flowColors[i * 3] = color.r;
      flowColors[i * 3 + 1] = color.g;
      flowColors[i * 3 + 2] = color.b;

      flowParticles.push({
        connectionIndex: Math.floor(Math.random() * connections.length),
        progress: progress,
        speed: (Math.random() * 0.5 + 0.5) * parameters.flowSpeed,
        life: 1.0
      });
    }

    objectPool.flowGeometry.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
    objectPool.flowGeometry.setAttribute('color', new THREE.BufferAttribute(flowColors, 3));

    objectPool.flowMaterial = new THREE.PointsMaterial({
      size: parameters.flowParticleSize * 0.5, // Smaller, more subtle particles
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4, // More transparent for silky effect
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    objectPool.flowParticles = new THREE.Points(objectPool.flowGeometry, objectPool.flowMaterial);
    scene.add(objectPool.flowParticles);
  };

  generateNetwork();

  const sizes = {
    width: canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth,
    height: canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight
  };
  
  console.log('Renderer sizes:', sizes);

  const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 1, 4);
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false, // Disable for better performance
    powerPreference: 'high-performance'
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduce pixel ratio for performance

  const handleResize = () => {
    sizes.width = canvas.clientWidth || canvas.parentElement.clientWidth;
    sizes.height = canvas.clientHeight || canvas.parentElement.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', handleResize);

  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();

    // Rotate camera around network
    if (objectPool.nodes) {
      camera.position.x = Math.cos(elapsedTime * 0.1) * 4;
      camera.position.z = Math.sin(elapsedTime * 0.1) * 4;
      camera.lookAt(0, 0, 0);
    }

    // Skip node pulsing for better performance

    // Update flowing particles with spiral motion
    if (objectPool.flowParticles && connections.length > 0) {
      const positions = objectPool.flowGeometry.attributes.position.array;
      
      for (let i = 0; i < flowParticles.length; i++) {
        const particle = flowParticles[i];
        particle.progress += particle.speed * deltaTime;
        
        if (particle.progress > 1) {
          particle.progress = 0;
          particle.connectionIndex = Math.floor(Math.random() * connections.length);
        }

        const connection = connections[particle.connectionIndex];
        if (connection) {
          const fromPos = networkNodes[connection.from].position;
          const toPos = networkNodes[connection.to].position;
          
          // Base linear interpolation
          const currentPos = fromPos.clone().lerp(toPos, particle.progress);
          
          // Add spiral motion perpendicular to the connection line
          const direction = toPos.clone().sub(fromPos).normalize();
          const perpendicular = new THREE.Vector3();
          
          // Create perpendicular vector
          if (Math.abs(direction.y) < 0.9) {
            perpendicular.crossVectors(direction, new THREE.Vector3(0, 1, 0));
          } else {
            perpendicular.crossVectors(direction, new THREE.Vector3(1, 0, 0));
          }
          perpendicular.normalize();
          
          // Simplified linear motion for better performance
          // Skip spiral calculations
          
          positions[i * 3] = currentPos.x;
          positions[i * 3 + 1] = currentPos.y;
          positions[i * 3 + 2] = currentPos.z;
        }
      }
      
      objectPool.flowGeometry.attributes.position.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  return () => {
    window.removeEventListener('resize', handleResize);
    
    // Safely cleanup nodes
    if (objectPool.nodes) {
      scene.remove(objectPool.nodes);
      if (objectPool.nodeGeometry) objectPool.nodeGeometry.dispose();
      if (objectPool.nodeMaterial) objectPool.nodeMaterial.dispose();
    }
    
    // Safely cleanup connections
    if (objectPool.connections) {
      scene.remove(objectPool.connections);
      if (objectPool.connectionGeometry) objectPool.connectionGeometry.dispose();
      if (objectPool.connectionMaterial) objectPool.connectionMaterial.dispose();
    }
    
    // Safely cleanup flow particles
    if (objectPool.flowParticles) {
      scene.remove(objectPool.flowParticles);
      if (objectPool.flowGeometry) objectPool.flowGeometry.dispose();
      if (objectPool.flowMaterial) objectPool.flowMaterial.dispose();
    }
    
    // Cleanup renderer
    if (renderer) {
      renderer.dispose();
    }
  };
};
