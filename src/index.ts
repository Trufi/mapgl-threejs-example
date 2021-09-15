/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';

const loader = new GLTFLoader();

const lngLatcenter = [82.92065129285754, 55.02554021395639];

const map = ((window as any).map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: lngLatcenter,
    zoom: 18,
    pitch: 45,
    rotation: 45,
}));

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

const model = new THREE.Object3D();

loader.load('./asia_building/scene.gltf', (gltf) => {
    model.add(gltf.scene);
    model.rotateX(Math.PI / 2);
    model.rotateY((8 * Math.PI) / 180);
    const mapPointCenter = mapPointFromLngLat([82.9206210338287, 55.025532994612504]);
    const k = 60; // about 50 meters
    model.scale.set(k / 2, k, k);
    model.position.set(mapPointCenter[0], mapPointCenter[1], 0);
    scene.add(model);
});

function loop() {
    requestAnimationFrame(loop);
    camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
    if (map.getStyleZoom() < 17) {
        scene.remove(model);
    } else {
        scene.add(model);
    }
    renderer.render(scene, camera);
}
requestAnimationFrame(loop);
