export class UI {
    constructor(cart) {
        this.cart = cart;
        this.sketch = new p5((p) => {
            p.setup = () => this.setup(p);
            p.draw = () => this.draw(p);
            p.windowResized = () => this.windowResized(p);
        });
    }

    setup(p) {
        // Create canvas that overlays the 3D scene
        this.canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        this.canvas.style('position', 'fixed');
        this.canvas.style('top', '0');
        this.canvas.style('left', '0');
        this.canvas.style('pointer-events', 'none');
        this.canvas.style('z-index', '100');
    }

    draw(p) {
        p.clear(); // Clear the canvas each frame

        // Get cart stats
        const position = this.cart.getPosition();
        const velocity = this.cart.velocity;
        const height = position ? position.y.toFixed(1) : '0.0';
        const speed = (velocity * 100).toFixed(1); // Scale for better readability

        // Draw stats panel
        p.push();
        p.fill(255, 255, 255, 200);
        p.noStroke();
        p.rect(20, 20, 200, 100, 10);

        // Draw text
        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text('Height: ' + height + ' m', 35, 50);
        p.text('Speed: ' + speed + ' km/h', 35, 80);
        p.pop();

        // Draw height bar
        const maxHeight = 30; // Maximum expected height
        const heightBarHeight = 200;
        p.push();
        p.translate(p.width - 60, p.height - 50);
        p.rotate(-p.PI / 2);

        // Draw background bar
        p.fill(200);
        p.rect(0, 0, heightBarHeight, 20, 10);

        // Draw current height
        const heightPercent = Math.min(position ? position.y / maxHeight : 0, 1);
        p.fill(100, 200, 255);
        p.rect(0, 0, heightBarHeight * heightPercent, 20, 10);
        p.pop();

        // Draw speed gauge
        const maxSpeed = 0.5; // Maximum expected speed
        const gaugeWidth = 200;
        p.push();
        p.translate(p.width - gaugeWidth - 50, p.height - 50);

        // Draw background gauge
        p.fill(200);
        p.rect(0, 0, gaugeWidth, 20, 10);

        // Draw current speed
        const speedPercent = Math.min(velocity / maxSpeed, 1);
        p.fill(255, 100, 100);
        p.rect(0, 0, gaugeWidth * speedPercent, 20, 10);
        p.pop();
    }

    windowResized(p) {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
}