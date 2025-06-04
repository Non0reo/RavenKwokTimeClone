class TextParticle extends PointForce {
  constructor(options = {}) {
    super(options);

    console.log("TextParticle created with options:", options);

    // Options and configuration
    this.options = options;
    this.text = options.text || "";
    this.tag = options.tag || "";
    this.doDrawTextPath = !!options.doDrawTextPath;
    this.isStatic = !!options.isStatic;

    // Position and movement
    this.position = createVector(options.x || 0, options.y || 0);
    this.velocity = createVector(0, 0);

    // Size
    this.defaultSize = options.size || 0;
    this.addedSize = 100;
    this.size = this.defaultSize;

    // Colors
    this.setColor(options.color === undefined ? color(random(colors)) : color(options.color));

    // Text path (if enabled)
    if (this.doDrawTextPath) {
      this.textPath = font.getPath(this.text, 0, 0, this.defaultSize || 100);
    }
  }

  setColor(colorIn) {
    this.defaultColor = colorIn;
    this.brightColor = color(
      min(red(colorIn) + 100, 255),
      min(green(colorIn) + 100, 255),
      min(blue(colorIn) + 100, 255)
    );
  }

  repulsion(object) {
      if (!this.doColision || !object.doColision) return; // Skip if not colliding or static
      
      if (object instanceof PointForce) {
        let pointDistance = dist(this.position.x, this.position.y, object.position.x, object.position.y);
        let pointAngle = atan2(this.position.y - object.position.y, this.position.x - object.position.x);

        // Use the sum of both particles' radii for collision/repulsion distance
        let combinedSize = (this.size + object.size) / 2;
        let repulsionRadius = combinedSize * repulsionDistMult;
        let pointF = constrain(map(pointDistance, 0, repulsionRadius, 10, 0), 0, 2);
        

        this.velocity.x += pointF * cos(pointAngle);
        this.velocity.y += pointF * sin(pointAngle);
      }

      else if (object instanceof RectangleForce) {
        // Calculate the distance to the rectangle's center
        let rectCenterX = object.position.x;
        let rectCenterY = object.position.y;
        let rectWidth = object.area.x;
        let rectHeight = object.area.y;

        // Calculate the closest point on the rectangle to the particle
        let closestX = constrain(this.position.x, rectCenterX - rectWidth / 2, rectCenterX + rectWidth / 2);
        let closestY = constrain(this.position.y, rectCenterY - rectHeight / 2, rectCenterY + rectHeight / 2);

        // Calculate the distance from the particle to this closest point
        let distToRect = dist(this.position.x, this.position.y, closestX, closestY);
        
        // Use the sum of both particles' radii for collision/repulsion distance
        let combinedSize = (this.size + object.size) / 2;
        let repulsionRadius = combinedSize * repulsionDistMult;

        if (distToRect < repulsionRadius) {
          let angleToRect = atan2(this.position.y - closestY, this.position.x - closestX);
          let forceMagnitude = constrain(map(distToRect, 0, repulsionRadius, 10, 0), 0, 2);

          this.velocity.x += forceMagnitude * cos(angleToRect);
          this.velocity.y += forceMagnitude * sin(angleToRect);
          console.log(`Repulsion from rectangle at (${rectCenterX}, ${rectCenterY}) with size (${rectWidth}, ${rectHeight})`);
        }
      }

  }

  update() {

    //prevent particles from going out of bounds without killing them
    if (
      this.position.x < oobKill.left || this.position.x > width + oobKill.right ||
      this.position.y < oobKill.top || this.position.y > height + oobKill.bottom
    ) {
      this.position.x = constrain(this.position.x, oobKill.left, width + oobKill.right);
      this.position.y = constrain(this.position.y, oobKill.top, height + oobKill.bottom);
    }

    // Apply velocity to positionition
    //this.velocity.limit(2); // Limit the velocity to prevent excessive speed

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
  }



  display() {
    
    //this.isStatic ? fill(255) : fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    textAlign(CENTER, CENTER);
    textSize(this.size);
    text(this.text, this.position.x + this.size * 0.01, this.position.y - this.size / 7);

    push();
    //translate(-this.defaultSize * 0.21, this.defaultSize * 0.38); // Adjust position to center the text path
    //scale(0.5); // Scale down the text path for better visibility
    translate(this.position.x, this.position.y); // Center the text path at the particle's position
    //rotate(mouseX * 0.002 + mouseY * 0.002); // Rotate based on mouse position for a dynamic effect

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


  applyWaveEffect(wave, particlesOptions = {}) {
    const { text, size, color } = particlesOptions; // Destructure options for text and size

    if (!this.doColision) return; // Skip if not colliding
    this.addedSize = 100;

    let distance = dist(this.position.x, this.position.y, wave.x, wave.y);
    if (distance < wave.radius) {
      let angle = atan2(this.position.y - wave.y, this.position.x - wave.x);
      let forceMagnitude = constrain(map(distance, 0, wave.targetedRadius, 10, 0), 0, 10);

      this.velocity.x += forceMagnitude * cos(angle) * 0.7;
      this.velocity.y += forceMagnitude * sin(angle) * 0.7;

      if (text) {
        this.text = text // Update the text to the wave's text
      }
      if (size) {
        this.defaultSize = size; // Update the size to the wave's size
      }
      if (color) {
        this.setColor(color); // Update the color to the wave's color
      }
    }
  }

  /* debugDisplay() {
    fill(128, 0, 0, 130); // Semi-transparent color for debugging
    circle(this.position.x, this.position.y, this.size * repulsionDistMult); // Debugging circle

    //draw velocity vector arrow
    stroke(255, 0, 0);
    strokeWeight(2);
    line(this.position.x, this.position.y, this.position.x + this.velocity.x * 10, this.position.y + this.velocity.y * 10);
    noStroke();
    fill(255, 0, 0);
    circle(this.position.x, this.position.y, 5); // Draw a small circle at the particle's positionition


  } */
  
}

