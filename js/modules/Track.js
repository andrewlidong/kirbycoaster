import * as THREE from './../../node_modules/three/build/three.module.js';

export class Track {
    constructor(scene) {
        this.scene = scene;
        this.createTrack();
    }

    createTrack() {
        // Create a fun, looping track with curves
        const points = [];

        // Starting platform
        points.push(new THREE.Vector3(0, 5, 0));
        points.push(new THREE.Vector3(10, 5, 0));

        // First hill
        points.push(new THREE.Vector3(20, 15, 0));
        points.push(new THREE.Vector3(30, 20, 0));
        points.push(new THREE.Vector3(40, 15, 10));

        // Loop around
        points.push(new THREE.Vector3(50, 10, 20));
        points.push(new THREE.Vector3(40, 8, 30));
        points.push(new THREE.Vector3(20, 8, 35));
        points.push(new THREE.Vector3(0, 12, 30));
        points.push(new THREE.Vector3(-20, 15, 20));

        // Fun curve back
        points.push(new THREE.Vector3(-30, 18, 0));
        points.push(new THREE.Vector3(-20, 12, -20));
        points.push(new THREE.Vector3(0, 8, -30));
        points.push(new THREE.Vector3(20, 6, -20));

        // Final approach
        points.push(new THREE.Vector3(30, 5, -10));
        points.push(new THREE.Vector3(20, 5, 0));
        points.push(new THREE.Vector3(10, 5, 0));
        points.push(new THREE.Vector3(0, 5, 0));

        // Create the spline
        this.spline = new THREE.CatmullRomCurve3(points);
        this.spline.closed = true;

        this.createMainTrack();
        this.createRails();
        this.createSupports();
    }

    createMainTrack() {
        const tubeGeometry = new THREE.TubeGeometry(
            this.spline,
            200,    // tubular segments
            0.5,    // radius
            16,     // radial segments
            true    // closed
        );

        const trackMaterial = new THREE.MeshPhongMaterial({
            color: 0xffb7dd,  // Pastel pink
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide
        });

        this.mainTrack = new THREE.Mesh(tubeGeometry, trackMaterial);
        this.mainTrack.castShadow = true;
        this.mainTrack.receiveShadow = true;
        this.scene.add(this.mainTrack);
    }

    createRails() {
        const railOffset = 0.6;
        const numPoints = 200;
        const railMaterial = new THREE.MeshPhongMaterial({
            color: 0xff99cc,  // Lighter pink
            specular: 0xffffff,
            shininess: 100
        });

        const leftRailPoints = [];
        const rightRailPoints = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const point = this.spline.getPointAt(t);
            const tangent = this.spline.getTangentAt(t);
            const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();

            leftRailPoints.push(point.clone().add(normal.clone().multiplyScalar(railOffset)));
            rightRailPoints.push(point.clone().add(normal.clone().multiplyScalar(-railOffset)));
        }

        const leftRailCurve = new THREE.CatmullRomCurve3(leftRailPoints);
        const rightRailCurve = new THREE.CatmullRomCurve3(rightRailPoints);

        const railGeometry = {
            steps: 200,
            radius: 0.1,
            radialSegments: 8,
            closed: true
        };

        const leftRailGeometry = new THREE.TubeGeometry(
            leftRailCurve,
            railGeometry.steps,
            railGeometry.radius,
            railGeometry.radialSegments,
            railGeometry.closed
        );

        const rightRailGeometry = new THREE.TubeGeometry(
            rightRailCurve,
            railGeometry.steps,
            railGeometry.radius,
            railGeometry.radialSegments,
            railGeometry.closed
        );

        const leftRail = new THREE.Mesh(leftRailGeometry, railMaterial);
        const rightRail = new THREE.Mesh(rightRailGeometry, railMaterial);

        leftRail.castShadow = true;
        rightRail.castShadow = true;
        this.scene.add(leftRail);
        this.scene.add(rightRail);
    }

    createSupports() {
        const supportMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,  // Light gray
            specular: 0xffffff,
            shininess: 30
        });

        // Create supports every few segments
        const numSupports = 40;
        for (let i = 0; i < numSupports; i++) {
            const t = i / numSupports;
            const point = this.spline.getPointAt(t);
            const tangent = this.spline.getTangentAt(t);

            // Only create supports above a certain height
            if (point.y > 5.5) {
                // Create main support pillar
                const pillarHeight = point.y - 0.5; // Subtract small amount for ground intersection
                const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.5, pillarHeight, 8);
                const pillar = new THREE.Mesh(pillarGeometry, supportMaterial);

                // Position the pillar
                pillar.position.set(point.x, pillarHeight / 2, point.z);
                pillar.castShadow = true;
                pillar.receiveShadow = true;

                // Create cross support if the track is high enough
                if (pillarHeight > 10) {
                    const crossHeight = pillarHeight * 0.7;
                    const crossGeometry = new THREE.CylinderGeometry(0.2, 0.2, pillarHeight * 0.4, 8);
                    const cross = new THREE.Mesh(crossGeometry, supportMaterial);

                    // Calculate angle for cross support
                    const angle = Math.atan2(tangent.z, tangent.x);
                    cross.rotation.x = Math.PI / 4;
                    cross.rotation.y = angle;
                    cross.position.set(point.x, crossHeight, point.z);

                    cross.castShadow = true;
                    this.scene.add(cross);

                    // Add a second cross support perpendicular to the first
                    const cross2 = cross.clone();
                    cross2.rotation.y = angle + Math.PI / 2;
                    this.scene.add(cross2);
                }

                // Create base for the pillar
                const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8);
                const base = new THREE.Mesh(baseGeometry, supportMaterial);
                base.position.set(point.x, 0.25, point.z);
                base.castShadow = true;
                base.receiveShadow = true;

                this.scene.add(pillar);
                this.scene.add(base);
            }
        }
    }

    getPointAtT(t) {
        return this.spline.getPointAt(t % 1);
    }

    getTangentAtT(t) {
        return this.spline.getTangentAt(t % 1);
    }
}