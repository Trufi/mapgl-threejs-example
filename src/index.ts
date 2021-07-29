/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';

const loader = new GLTFLoader();

const lngLatcenter = [82.92494, 55.0294];

const map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: lngLatcenter,
    zoom: 16.8,
});

const camera = new THREE.Camera();
camera.updateMatrixWorld = () => {};

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three') as HTMLCanvasElement,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', () => {
    map.invalidateSize();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

const light = new THREE.AmbientLight(0x404040);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 0, 1);

const scene = new THREE.Scene();
scene.add(light, directionalLight);

const airplanes: Array<{ mesh: THREE.Object3D; direction: THREE.Vector3 }> = [];

for (let i = 0; i < 100; i++) {
    airplanes.push(createAirplane());
}

function createAirplane() {
    const angle = Math.random() * Math.PI * 2;
    const mesh = new THREE.Object3D();
    const k = 300; // about 50 meters
    mesh.scale.set(k, k, k);
    mesh.rotateY(Math.PI / 2);
    mesh.rotateX(Math.PI / 2 - angle);
    mesh.updateMatrix();
    mesh.updateWorldMatrix(true, true);

    const mapPointCenter = mapPointFromLngLat(lngLatcenter);
    mesh.position.set(
        mapPointCenter[0] + (Math.random() - 0.5) * 300000,
        mapPointCenter[1] + (Math.random() - 0.5) * 300000,
        20000 + Math.random() * 100000,
    );
    scene.add(mesh);

    loader.load('./a5.glb', (gltf) => {
        gltf.scene.rotateZ(Math.PI / 2);
        mesh.add(gltf.scene);
    });

    const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);

    return { mesh, direction };
}

let lastUpdateTime = Date.now();
function loop() {
    requestAnimationFrame(loop);

    const now = Date.now();
    const dt = now - lastUpdateTime;

    airplanes.forEach((airplane) => {
        airplane.mesh.position.addScaledVector(airplane.direction, dt * 2);
    });

    camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
    renderer.render(scene, camera);

    lastUpdateTime = now;
}
requestAnimationFrame(loop);
