class TextParticle {
  constructor(options) {
    console.log("TextParticle created with options:", options);

    this.options = options || {};
    this.text = this.options.text || ""; // Default to empty string if no text is provided
    this.position = createVector(this.options.x || 0, this.options.y || 0);
    this.isStatic = this.options.isStatic || false; // If true, the particle will not move
    this.tag = this.options.tag || ""; // Optional tag for the particle
    this.doColision = this.options.doColision !== undefined ? this.options.doColision : true; // Default to true if not specified
    this.textSizeAdded = this.options.textSizeAdded || 0; // Additional collision force, default to 0

    const sizeIn = this.options.size || 0; // Default size if not provided

    this.defaultSize = sizeIn;
    this.addedSize = 100;
    this.size = sizeIn;

    
    this.velocity = createVector(0, 0);

    const randomColor = color(random(colors));
    this.defaultColor = randomColor;

    this.brightColor = color(
      min(red(randomColor) + 100, 255),
      min(green(randomColor) + 100, 255),
      min(blue(randomColor) + 100, 255)
    );
  }

  repulsion(point) {
      if (!this.doColision || !point.doColision) return; // Skip if not colliding or static
      
      let pointDistance = dist(this.position.x, this.position.y, point.position.x, point.position.y);
      let pointAngle = atan2(this.position.y - point.position.y, this.position.x - point.position.x);

      // Use the sum of both particles' radii for collision/repulsion distance
      let combinedSize = (this.size + point.size) / 2;
      let repulsionRadius = combinedSize * repulsionDistMult;
      let pointF = constrain(map(pointDistance, 0, repulsionRadius, 10, 0), 0, 2);
      

      this.velocity.x += pointF * cos(pointAngle);
      this.velocity.y += pointF * sin(pointAngle);

  }

  update() {

    //prevent particles from going out of bounds without killing them
    if (this.position.x < -oob_kill || this.position.x > width + oob_kill || this.position.y < -oob_kill || this.position.y > height + oob_kill) {
      this.position.x = constrain(this.position.x, -oob_kill, width + oob_kill);
      this.position.y = constrain(this.position.y, -oob_kill, height + oob_kill);
    }

    // Apply velocity to positionition
    //this.velocity.limit(5); // Limit the velocity to prevent excessive speed

    // Use a fixed decay factor for addedSize to avoid unnecessary calculations and reduce lag
    if (abs(this.addedSize) > 0.1) {
      this.addedSize *= 0.92;
    } else {
      this.addedSize = 0;
    }

    this.size = this.defaultSize + this.addedSize; // Update size based on distance to mouse

    if (!this.isStatic && this.doColision) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
    
    this.velocity.mult(0.8);


    /* if (this.position.x < -oob_kill || this.position.x > width + oob_kill || this.position.y < -oob_kill || this.position.y > height + oob_kill) {
      textParticles.splice(textParticles.indexOf(this), 1);
    } */

  }

  display() {
    
    this.isStatic ? fill(255) : fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    textSize(this.size + this.textSizeAdded);
    textAlign(CENTER, CENTER);
    text(this.text, this.position.x, this.position.y - this.size / 8);
  }

  debugDisplay() {
    fill(128, 0, 0, 130); // Semi-transparent color for debugging
    circle(this.position.x, this.position.y, this.size * repulsionDistMult); // Debugging circle

    //draw velocity vector arrow
    stroke(255, 0, 0);
    strokeWeight(2);
    line(this.position.x, this.position.y, this.position.x + this.velocity.x * 10, this.position.y + this.velocity.y * 10);
    noStroke();
    fill(255, 0, 0);
    circle(this.position.x, this.position.y, 5); // Draw a small circle at the particle's positionition
  }
  
}


class Force {
  constructor(options) {
    this.options = options || {};
    this.position = createVector(this.options.x || 0, this.options.y || 0);
    this.defaultSize = this.options.strength || 0;
    this.size = this.defaultSize;
    this.isStatic = true; // Static force, does not move
    this.tag = this.options.tag || ""; // Tag for identification
    this.doColision = this.options.doColision; // Static forces do not repel particles

    console.log("Force created at", this.position.x, this.position.y, "with strength", this.size);
  }

  repulsion(point) {
    // Skip repulsion logic for static force
  }

  update() {
    // No update logic needed for static force
  }

  display() {
    // Display the force as a circle
  }

  debugDisplay() {
    fill(255, 0, 0, 130); // Semi-transparent color for debugging
    circle(this.position.x, this.position.y, this.size * repulsionDistMult); // Debugging circle
  }
}