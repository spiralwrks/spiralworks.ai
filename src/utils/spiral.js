import * as THREE from 'three';

export const initializeGalaxy = (canvasRef) => {
  if (!canvasRef.current) {
    console.error('No canvas ref provided for WebGL');
    return;
  }

  const canvas = canvasRef.current;
  

  // Scene
  const scene = new THREE.Scene();

  function isMobile() {
    return /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Parameters
  const parameters = {
    count: 100000,
    size: isMobile() ? 0.013 : 0.014,
    radius: isMobile() ? 1.2 : 1.5,
    branches: 8,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 2.5,
    insideColor: '#8622c9',
    outsideColor: '#3222c9'
  };

  // Geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Material
  const material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  // Points
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Sizes
  // const sizes = {
  //   width: window.innerWidth,
  //   height: window.innerHeight - (document.querySelector('.text-container') ? document.querySelector('.text-container').offsetHeight : 0)
  // };
   // Update the sizes object
  //  const sizes = {
  //   width: canvas.clientWidth,
  //   height: canvas.clientHeight,
  // };
   const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 4, 5);
  camera.lookAt(0, -6, 0);
  scene.add(camera);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Handle window resize
  // const handleResize = () => {
  //   sizes.width = window.innerWidth;
  //   sizes.height = window.innerHeight - (document.querySelector('.text-container') ? document.querySelector('.text-container').offsetHeight : 0);

  //   camera.aspect = sizes.width / sizes.height;
  //   camera.updateProjectionMatrix();

  //   renderer.setSize(sizes.width, sizes.height);
  //   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // };
  // Update the handleResize function
  const handleResize = () => {
    sizes.width = canvas.clientWidth;
    sizes.height = canvas.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', handleResize);

  // Animation loop
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    points.rotation.y = elapsedTime * 0.2;
    
    renderer.clear();
    renderer.render(scene, camera);
    
    window.requestAnimationFrame(tick);
  };

  tick();

  // Return a cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    // Dispose of Three.js objects
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
};