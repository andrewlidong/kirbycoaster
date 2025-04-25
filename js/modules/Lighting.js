import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.createLights();
    }

    createLights() {
        // Main directional light (sun)
        this.mainLight = new THREE.DirectionalLight(0xffffcc, 1.2);
        this.mainLight.position.set(50, 100, 50);
        this.mainLight.castShadow = true;

        // Optimize shadow settings
        this.mainLight.shadow.mapSize.width = 2048;
        this.mainLight.shadow.mapSize.height = 2048;
        this.mainLight.shadow.camera.near = 0.5;
        this.mainLight.shadow.camera.far = 500;
        this.mainLight.shadow.camera.left = -100;
        this.mainLight.shadow.camera.right = 100;
        this.mainLight.shadow.camera.top = 100;
        this.mainLight.shadow.camera.bottom = -100;

        // Add soft ambient light
        this.ambientLight = new THREE.AmbientLight(0xffccff, 0.6);

        // Add hemisphere light for sky-ground color variation
        this.hemisphereLight = new THREE.HemisphereLight(
            0xffffff,  // Sky color
            0xffe0e0,  // Ground color
            0.6        // Intensity
        );

        // Add some point lights for extra sparkle
        this.createSparkles();

        this.scene.add(this.mainLight);
        this.scene.add(this.ambientLight);
        this.scene.add(this.hemisphereLight);
    }

    createSparkles() {
        this.sparkles = [];
        const colors = [0xffff00, 0xff00ff, 0x00ffff];

        for (let i = 0; i < 5; i++) {
            const sparkle = new THREE.PointLight(
                colors[i % colors.length],
                0.8,
                50,
                2
            );
            sparkle.position.set(
                (Math.random() - 0.5) * 100,
                20 + Math.random() * 30,
                (Math.random() - 0.5) * 100
            );
            this.sparkles.push(sparkle);
            this.scene.add(sparkle);
        }
    }

    update() {
        // Animate sparkle lights
        const time = Date.now() * 0.001;
        this.sparkles.forEach((sparkle, i) => {
            sparkle.intensity = 0.5 + Math.sin(time * 2 + i) * 0.3;
            sparkle.position.y += Math.sin(time + i) * 0.05;
        });
    }
}