import * as THREE from 'three';

const objectPool = {
  geometry: null,
  material: null,
  points: null,
};

export const initializeGalaxy = (canvasRef) => {
  if (!canvasRef.current) {
    console.error('No canvas ref provided for WebGL');
    return;
  }

  const canvas = canvasRef.current;
  const scene = new THREE.Scene();

  const isMobile = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const parameters = {
    count: isMobile ? 45000 : 90000, // Slightly reduced particle count
    size: isMobile ? 0.011 : 0.012, // Reduced particle size
    radius: isMobile ? 1.0 : 1.3, // Reduced galaxy radius
    branches: 8,
    spin: 1,
    randomness: 0.18, // Slightly reduced randomness
    randomnessPower: 2.5,
    insideColor: '#8622c9',
    outsideColor: '#3222c9'
  };

  const generateGalaxy = () => {
    if (objectPool.points) {
      scene.remove(objectPool.points);
      objectPool.geometry.dispose();
      objectPool.material.dispose();
    }

    objectPool.geometry = new THREE.BufferGeometry();
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

    objectPool.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    objectPool.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    objectPool.material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    objectPool.points = new THREE.Points(objectPool.geometry, objectPool.material);
    scene.add(objectPool.points);
  };

  generateGalaxy();

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 3.5, 4.5); // Adjusted camera position
  camera.lookAt(0, -5, 0); // Adjusted look-at point
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power'
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const handleResize = () => {
    sizes.width = canvas.clientWidth;
    sizes.height = canvas.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', handleResize);

  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    if (objectPool.points) {
      objectPool.points.rotation.y = elapsedTime * 0.2;
    }
    
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  return () => {
    window.removeEventListener('resize', handleResize);
    if (objectPool.points) {
      scene.remove(objectPool.points);
      objectPool.geometry.dispose();
      objectPool.material.dispose();
    }
    renderer.dispose();
  };
};
