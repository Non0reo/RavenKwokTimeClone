
class Force {
    constructor(options) {
        this.options = options || {};
        this.position = createVector(options.x || 0, options.y || 0);
        this.tag = options.tag || "";
        this.doColision = options.doColision ?? true;
    }

    repulsion(point) { }

    update() { }

    display() { }

    debugDisplay() { }

    remove() {
        // Remove this force from the forces array
        let index = forces.indexOf(this);
        if (index > -1) {
            forces.splice(index, 1);
            console.log("Force removed at", this.position.x, this.position.y);
        }
    }
}


class PointForce extends Force {
    constructor(options) {
        super(options);
        this.defaultSize = this.options.size || 0;
        this.size = this.defaultSize;
        this.strength = this.options.strength || -1;

        //console.log("Force created at", this.position.x, this.position.y, "with size", this.size);
    }
    debugDisplay() {
        if (!this.doColision) return;
        fill(255, 0, 0, 130);
        circle(this.position.x, this.position.y, this.size * repulsionDistMult);
    }

    applyForce(point) {
        if (!this.doColision || !point.doColision) return;

        let pointDistance = dist(this.position.x, this.position.y, point.position.x, point.position.y);
        let pointAngle = atan2(this.position.y - point.position.y, this.position.x - point.position.x);

        // Use the force's size for collision/repulsion distance
        let repulsionRadius = this.size * repulsionDistMult;
        let pointF = constrain(map(pointDistance, 0, repulsionRadius, 10, 0), 0, 2);

        // Repulsion/attraction force
        point.velocity.x += pointF * cos(pointAngle) * this.strength;
        point.velocity.y += pointF * sin(pointAngle) * this.strength;
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

        //console.log("RectangleForce created at", this.position.x, this.position.y, "with size", this.area.x, this.area.y);
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