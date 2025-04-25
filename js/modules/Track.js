import * as THREE from 'three';

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

        // Create visual elements
        const tubeGeometry = new THREE.TubeGeometry(
            this.spline,
            200,    // tubular segments
            0.5,    // radius
            16,     // radial segments
            true    // closed
        );

        // Kirby-style pastel colors
        const trackMaterial = new THREE.MeshPhongMaterial({
            color: 0xffb7dd,  // Pastel pink
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide
        });

        const mainTrack = new THREE.Mesh(tubeGeometry, trackMaterial);
        mainTrack.castShadow = true;
        mainTrack.receiveShadow = true;
        this.scene.add(mainTrack);

        // Add decorative rails
        this.createRails();
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

    getPointAtT(t) {
        return this.spline.getPointAt(t % 1);
    }

    getTangentAtT(t) {
        return this.spline.getTangentAt(t % 1);
    }
}