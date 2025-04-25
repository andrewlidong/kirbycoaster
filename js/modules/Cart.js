import * as THREE from 'three';

export class Cart {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.cart = null;
        this.t = 0;
        this.velocity = 0.001;
        this.acceleration = 0;
        this.isMoving = true;
        this.starParticles = [];

        this.createCart();
        this.createStarTrail();
    }

    createCart() {
        const cartGroup = new THREE.Group();

        // Main body - rounded shape
        const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff9ecd,  // Kirby pink
            specular: 0xffffff,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.y = 0.5;
        body.scale.z = 1.2;
        body.castShadow = true;
        cartGroup.add(body);

        // Wheels - star-shaped
        const wheelGeometry = new THREE.CircleGeometry(0.25, 5);  // 5 points for star shape
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0xffdf00,  // Gold color
            specular: 0xffffff,
            shininess: 100
        });

        const wheelPositions = [
            [-0.4, -0.3, 0.5],
            [0.4, -0.3, 0.5],
            [-0.4, -0.3, -0.5],
            [0.4, -0.3, -0.5]
        ];

        wheelPositions.forEach(position => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.y = Math.PI / 2;
            wheel.position.set(...position);
            wheel.castShadow = true;
            cartGroup.add(wheel);
        });

        // Cute face
        const faceGroup = new THREE.Group();
        faceGroup.position.z = 0.6;
        faceGroup.position.y = 0.1;

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 0, 0);
        faceGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 0, 0);
        faceGroup.add(rightEye);

        // Rosy cheeks
        const cheekGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const cheekMaterial = new THREE.MeshPhongMaterial({ color: 0xff7f7f });

        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-0.3, -0.1, -0.1);
        faceGroup.add(leftCheek);

        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(0.3, -0.1, -0.1);
        faceGroup.add(rightCheek);

        cartGroup.add(faceGroup);

        // Add decorative stars
        const starGeometry = new THREE.OctahedronGeometry(0.15);
        const starMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            specular: 0xffffff,
            shininess: 100
        });

        for (let i = 0; i < 3; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                (Math.random() - 0.5) * 0.5,
                0.5 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            );
            star.rotation.y = Math.random() * Math.PI;
            cartGroup.add(star);
        }

        this.cart = cartGroup;
        this.scene.add(this.cart);
    }

    createStarTrail() {
        const starGeometry = new THREE.OctahedronGeometry(0.1);
        const starMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            specular: 0xffffff,
            shininess: 100,
            transparent: true,
            opacity: 1
        });

        for (let i = 0; i < 10; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial.clone());
            star.visible = false;
            this.starParticles.push({
                mesh: star,
                life: 0,
                maxLife: 1,
                offset: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                )
            });
            this.scene.add(star);
        }
    }

    updateStarTrail() {
        if (!this.isMoving) return;

        this.starParticles.forEach(particle => {
            if (particle.life <= 0 && Math.random() < 0.1) {
                particle.mesh.visible = true;
                particle.life = particle.maxLife;
                particle.mesh.position.copy(this.cart.position).add(particle.offset);
            }

            if (particle.life > 0) {
                particle.life -= 0.02;
                particle.mesh.material.opacity = particle.life;
                particle.mesh.position.y += 0.05;
                particle.mesh.rotation.y += 0.1;
            }

            if (particle.life <= 0) {
                particle.mesh.visible = false;
            }
        });
    }

    startMoving() {
        this.isMoving = true;
        this.velocity = Math.max(0.001, this.velocity);
    }

    stopMoving() {
        this.isMoving = false;
        this.velocity = 0;
        this.acceleration = 0;
    }

    update() {
        if (!this.isMoving) return;

        // Basic validation
        if (!this.track || !this.cart) {
            console.warn('Track or cart not initialized');
            return;
        }

        // Physics constants
        const gravity = 0.0008;
        const friction = 0.0002;
        const minVelocity = 0.001;
        const maxVelocity = 0.008;
        const maxAcceleration = 0.001;
        const maxPositionChange = 2.0;

        try {
            // Get current position and check if it's valid
            const point = this.track.getPointAtT(this.t);
            if (!point) {
                console.warn('Invalid track point');
                return;
            }

            const tangent = this.track.getTangentAtT(this.t);
            if (!tangent) {
                console.warn('Invalid track tangent');
                return;
            }

            // Calculate slope with bounds
            const slope = Math.atan2(
                Math.max(-1, Math.min(1, tangent.y)),
                Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z)
            );

            // Calculate centripetal force with safety checks
            const deltaT = 0.05;
            const nextT = this.t + deltaT;
            const prevT = Math.max(0, this.t - deltaT);

            const nextPoint = this.track.getPointAtT(nextT);
            const prevPoint = this.track.getPointAtT(prevT);

            if (!nextPoint || !prevPoint) {
                console.warn('Unable to calculate track curvature');
                return;
            }

            // Calculate curvature with additional safety checks
            const v1 = new THREE.Vector3().subVectors(nextPoint, point);
            const v2 = new THREE.Vector3().subVectors(prevPoint, point);

            const minDistance = 0.01;
            if (v1.length() < minDistance || v2.length() < minDistance) {
                this.velocity = Math.max(minVelocity, Math.min(maxVelocity, this.velocity));
                this.t += this.velocity;
                this.cart.position.copy(point);
                return;
            }

            v1.normalize();
            v2.normalize();

            const curvature = Math.min(Math.PI / 4, v1.angleTo(v2));
            const centripetalForce = Math.min(0.0005, curvature * this.velocity * this.velocity * 0.08);

            // Update physics with bounded acceleration
            const rawAcceleration = Math.sin(slope) * gravity - friction - centripetalForce;
            this.acceleration = Math.max(-maxAcceleration, Math.min(maxAcceleration, rawAcceleration));

            // Update velocity with smoother changes
            const targetVelocity = this.velocity + this.acceleration;
            this.velocity = this.velocity * 0.95 + targetVelocity * 0.05;
            this.velocity = Math.max(minVelocity, Math.min(maxVelocity, this.velocity));

            // Store previous state
            const prevPosition = this.cart.position.clone();
            const prevVelocity = this.velocity;

            // Update position
            this.t += this.velocity;
            this.cart.position.copy(point);

            // Verify position change is not too extreme
            const positionChange = this.cart.position.distanceTo(prevPosition);
            if (positionChange > maxPositionChange) {
                const safePosition = prevPosition.clone().lerp(point, 0.1);
                this.cart.position.copy(safePosition);
                this.velocity = prevVelocity * 0.8;
                return;
            }

            // Look ahead for rotation with additional checks
            const lookAhead = this.track.getPointAtT(this.t + deltaT);
            if (lookAhead && !lookAhead.equals(point)) {
                this.cart.lookAt(lookAhead);

                // Add banking effect with more conservative limits
                const maxBankAngle = Math.PI / 6;
                const bankAngle = Math.min(Math.max(-maxBankAngle, curvature * 1.2), maxBankAngle);
                this.cart.rotateZ(bankAngle);
            }

            // Update star trail
            this.updateStarTrail();

        } catch (error) {
            console.error('Error updating cart:', error);
            this.velocity = minVelocity;
            this.acceleration = 0;
        }
    }

    getPosition() {
        return this.cart.position;
    }

    getQuaternion() {
        return this.cart.quaternion;
    }
}