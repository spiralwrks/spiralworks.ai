import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Define a function to initialize the galaxy
export const initializeGalaxy = () => {
    const canvas = document.querySelector('canvas.webgl');

    if (!canvas) {
        console.error('No canvas found for WebGL');
        return;
    }

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

    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = () => {
        // Destroy old galaxy if exists
        if (points !== null) {
            geometry.dispose();
            material.dispose();
            scene.remove(points);
        }

        // Geometry
        geometry = new THREE.BufferGeometry();
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
        material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        // Points
        points = new THREE.Points(geometry, material);
        scene.add(points);
    };

    generateGalaxy();

    // Sizes
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight - (document.querySelector('.text-container') ? document.querySelector('.text-container').offsetHeight : 0)
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 4, 5); // position the camera above the origin and angled down
    camera.lookAt(0, -6, 0); // ensure the camera is looking at the origin
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // set alpha to true for transparent background
        antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle window resize
    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight - (document.querySelector('.text-container') ? document.querySelector('.text-container').offsetHeight : 0);

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Animation loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        points.rotation.y = elapsedTime * 0.2;
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
};
