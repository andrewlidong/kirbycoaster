import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.createGround();
        this.createClouds();
        this.createDecorations();
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

    update(cartPosition) {
        // Animate clouds
        this.clouds.children.forEach((cloud, i) => {
            cloud.position.x += Math.sin(Date.now() * 0.001 + i) * 0.02;
            cloud.position.y += Math.cos(Date.now() * 0.001 + i) * 0.01;
        });
    }
}