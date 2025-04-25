import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.createGround();
        this.createClouds();
        this.createDecorations();
        this.createGiantKirby();
    }

    createGround() {
        // Create a cute pastel ground
        const groundGeometry = new THREE.CircleGeometry(100, 64);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x98ff98,  // Pastel green
            specular: 0xffffff,
            shininess: 30
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createClouds() {
        this.clouds = new THREE.Group();

        // Create several cute puffy clouds
        const cloudPositions = [
            { x: -30, y: 30, z: -30 },
            { x: 40, y: 35, z: 20 },
            { x: -20, y: 25, z: 40 },
            { x: 30, y: 40, z: -40 }
        ];

        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 10,
            transparent: true,
            opacity: 0.9
        });

        cloudPositions.forEach(pos => {
            const cloud = this.createPuffyCloud(cloudMaterial);
            cloud.position.set(pos.x, pos.y, pos.z);
            cloud.scale.set(
                5 + Math.random() * 3,
                3 + Math.random() * 2,
                4 + Math.random() * 3
            );
            this.clouds.add(cloud);
        });

        this.scene.add(this.clouds);
    }

    createPuffyCloud(material) {
        const cloud = new THREE.Group();
        const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

        // Create multiple overlapping spheres for a puffy look
        const positions = [
            { x: 0, y: 0, z: 0 },
            { x: 1.2, y: 0.3, z: 0 },
            { x: -1, y: 0.2, z: 0 },
            { x: 0.5, y: 0.8, z: 0.5 },
            { x: -0.5, y: 0.7, z: -0.5 }
        ];

        positions.forEach(pos => {
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.set(pos.x, pos.y, pos.z);
            cloud.add(sphere);
        });

        return cloud;
    }

    createDecorations() {
        // Add cute star decorations
        const starGeometry = new THREE.OctahedronGeometry(1);
        const starMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            specular: 0xffffff,
            shininess: 100
        });

        for (let i = 0; i < 20; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            const angle = (i / 20) * Math.PI * 2;
            const radius = 60 + Math.random() * 20;

            star.position.x = Math.cos(angle) * radius;
            star.position.y = 10 + Math.random() * 30;
            star.position.z = Math.sin(angle) * radius;

            star.scale.set(0.5, 0.5, 0.5);
            star.rotation.y = Math.random() * Math.PI;

            this.scene.add(star);
        }
    }

    createGiantKirby() {
        // Create Kirby group
        this.kirby = new THREE.Group();

        // Main body (sphere)
        const bodyGeometry = new THREE.SphereGeometry(15, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffb7dd,  // Kirby pink
            specular: 0xffffff,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.kirby.add(body);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(2, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000  // Black
        });

        // Left eye
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-4, 4, 13);
        leftEye.scale.y = 1.5;
        this.kirby.add(leftEye);

        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(4, 4, 13);
        rightEye.scale.y = 1.5;
        this.kirby.add(rightEye);

        // Cheeks
        const cheekGeometry = new THREE.SphereGeometry(2.4, 16, 16);
        const cheekMaterial = new THREE.MeshPhongMaterial({
            color: 0xff9ecd,  // Slightly darker pink
            specular: 0xffffff,
            shininess: 20
        });

        // Left cheek
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-10, -2, 10);
        this.kirby.add(leftCheek);

        // Right cheek
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(10, -2, 10);
        this.kirby.add(rightCheek);

        // Position Kirby in the scene
        this.kirby.position.set(-80, 60, -100);
        this.scene.add(this.kirby);

        // Add a point light to highlight Kirby
        const kirbyLight = new THREE.PointLight(0xffffff, 1, 200);
        kirbyLight.position.set(-80, 80, -80);
        this.scene.add(kirbyLight);
    }

    update(cartPosition) {
        // Update clouds
        this.clouds.children.forEach((cloud, i) => {
            cloud.position.x += Math.sin(Date.now() * 0.001 + i) * 0.02;
            cloud.position.y += Math.cos(Date.now() * 0.001 + i) * 0.01;
        });

        // Update Kirby's movement
        if (this.kirby) {
            const time = Date.now() * 0.001;

            // Floating movement with larger range
            this.kirby.position.y = 60 + Math.sin(time * 0.5) * 10;
            this.kirby.position.x = -80 + Math.sin(time * 0.3) * 30;
            this.kirby.position.z = -100 + Math.cos(time * 0.4) * 30;

            // Gentle rotation with more movement
            this.kirby.rotation.y = Math.sin(time * 0.5) * 0.3;
            this.kirby.rotation.x = Math.sin(time * 0.3) * 0.2;
            this.kirby.rotation.z = Math.cos(time * 0.4) * 0.2;
        }
    }
}