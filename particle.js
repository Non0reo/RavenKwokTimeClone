class TextParticle {
  constructor(options = {}) {
    console.log("TextParticle created with options:", options);

    // Options and configuration
    this.options = options;
    this.text = options.text || "";
    this.tag = options.tag || "";
    this.doDrawTextPath = !!options.doDrawTextPath;
    this.doColision = options.doColision !== undefined ? options.doColision : true;
    this.isStatic = !!options.isStatic;
    this.textSizeAdded = options.textSizeAdded || 0;

    // Position and movement
    this.position = createVector(options.x || 0, options.y || 0);
    this.velocity = createVector(0, 0);

    // Size
    this.defaultSize = options.size || 0;
    this.addedSize = 100;
    this.size = this.defaultSize;

    // Colors
    const baseColor = color(random(colors));
    this.defaultColor = baseColor;
    this.brightColor = color(
      min(red(baseColor) + 100, 255),
      min(green(baseColor) + 100, 255),
      min(blue(baseColor) + 100, 255)
    );

    // Text path (if enabled)
    if (this.doDrawTextPath) {
      this.textPath = font.getPath(this.text, 0, 0, this.defaultSize || 100);
    }
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
    this.velocity.limit(2); // Limit the velocity to prevent excessive speed

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
    textAlign(CENTER, CENTER);

    if (this.hasStroke) {
      fill(0);
      textSize(this.size * 1.5 + this.textSizeAdded);
      text(this.text, this.position.x, this.position.y - this.size * 1.5 / 8);
      fill(255);
    }

    textSize(this.size + this.textSizeAdded);
    text(this.text, this.position.x, this.position.y - this.size / 8);

    push();
    //translate(-114, 180);
    //scale(0.5); // Scale down the text path for better visibility

    //draw a circle at each path point if doDrawTextPath is true
    if (this.doDrawTextPath) {
      beginShape();
      this.textPath.commands.forEach(cmd => {
      if (cmd.type === 'M') {
        // Move to (start new shape)
        vertex(cmd.x + this.position.x, cmd.y + this.position.y);
      } else if (cmd.type === 'L') {
        // Line to
        vertex(cmd.x + this.position.x, cmd.y + this.position.y);
      } else if (cmd.type === 'C') {
        // Bezier curve
        bezierVertex(
        cmd.x1 + this.position.x, cmd.y1 + this.position.y,
        cmd.x2 + this.position.x, cmd.y2 + this.position.y,
        cmd.x + this.position.x, cmd.y + this.position.y
        );
      } else if (cmd.type === 'Q') {
        // Quadratic curve
        quadraticVertex(
        cmd.x1 + this.position.x, cmd.y1 + this.position.y,
        cmd.x + this.position.x, cmd.y + this.position.y
        );
      } else if (cmd.type === 'Z') {
        // Close shape
        endShape(CLOSE);
        beginShape();
      }
      });
      endShape();
    } 

    pop();
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

  drawTextPath() {
    // No text path for force, but can be implemented if needed
  }

  display() {
    // Display the force as a circle
  }

  debugDisplay() {
    fill(255, 0, 0, 130); // Semi-transparent color for debugging
    circle(this.position.x, this.position.y, this.size * repulsionDistMult); // Debugging circle
  }
}