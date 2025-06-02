
class Force {
    constructor(options) {
        this.options = options || {};
        this.position = createVector(this.options.x || 0, this.options.y || 0);
        this.isStatic = true; // Static force, does not move
        this.tag = this.options.tag || ""; // Tag for identification
        this.doColision = this.options.doColision;
    }

    repulsion(point) { }

    update() { }

    display() { }

    debugDisplay() { }
}


class PointForce extends Force {
    constructor(options) {
        super(options);
        this.defaultSize = this.options.strength || 0;
        this.size = this.defaultSize;

        console.log("Force created at", this.position.x, this.position.y, "with strength", this.size);
    }
    debugDisplay() {
        fill(255, 0, 0, 130); // Semi-transparent color for debugging
        circle(this.position.x, this.position.y, this.size * repulsionDistMult); // Debugging circle
    }

    applyForce(point) {
        if (!this.doColision || !point.doColision) return; // Skip if not colliding or static

        let pointDistance = dist(this.position.x, this.position.y, point.position.x, point.position.y);
        let pointAngle = atan2(this.position.y - point.position.y, this.position.x - point.position.x);

        // Use the force's size for collision/repulsion distance
        let repulsionRadius = this.size;
        let pointF = constrain(map(pointDistance, 0, repulsionRadius, 10, 0), 0, 2);

        point.velocity.x -= pointF * cos(pointAngle);
        point.velocity.y -= pointF * sin(pointAngle);
    }

    remove() {
        // Remove this force from the forces array
        let index = forces.indexOf(this);
        if (index > -1) {
            forces.splice(index, 1);
            console.log("Force removed at", this.position.x, this.position.y);
        }
    }
}

class RectangleForce extends Force {
    constructor(options) {
        const fromCenter = !!options.fromCenter; // Whether the rectangle is defined from its center

        // Create a shallow copy of options and adjust x and y based on fromCenter
        let modifiedOptions = Object.assign({}, options);
        modifiedOptions.x = fromCenter ? (options.x || 0) : (options.x - options.width / 2);
        modifiedOptions.y = fromCenter ? (options.y || 0) : (options.y - options.height / 2);

        super(modifiedOptions);

        this.fromCenter = fromCenter; // Whether the rectangle is defined from its center
        this.area = createVector(options.width || 0, options.height || 0);

        console.log("RectangleForce created at", this.position.x, this.position.y, "with size", this.area.x, this.area.y);
    }

    debugDisplay() {
        fill(0, 255, 0, 130); // Semi-transparent color for debugging
        // Always draw as if from top-left corner, no rectMode changes
        let x = this.fromCenter ? this.position.x - this.area.x / 2 : this.position.x;
        let y = this.fromCenter ? this.position.y - this.area.y / 2 : this.position.y;
        rect(x, y, this.area.x, this.area.y);
    }

    applyForce(point) {
        if (!this.doColision || !point.doColision) return; // Skip if not colliding or static

        // Calculate the distance to the rectangle's center
        let rectCenterX = this.position.x;
        let rectCenterY = this.position.y;

        let pointDistance = dist(point.position.x, point.position.y, rectCenterX, rectCenterY);
        let pointAngle = atan2(point.position.y - rectCenterY, point.position.x - rectCenterX);

        // Use the rectangle's width and height for collision/repulsion distance
        let repulsionRadius = (this.area.x + this.area.y) / 4 * repulsionDistMult; // Average size for repulsion
        let pointF = constrain(map(pointDistance, 0, repulsionRadius, 4, 0), 0, 2);

        point.velocity.x += pointF * cos(pointAngle);
        point.velocity.y += pointF * sin(pointAngle);
    }
}