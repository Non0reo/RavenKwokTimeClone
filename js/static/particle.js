const COLLISION_METHOD = 1;

class TextParticle extends PointForce {
  constructor(options = {}) {
    super(options);

    //console.log("TextParticle created with options:", options);

    // Options and configuration
    this.options = options;
    this.text = options.text || "";
    this.tag = options.tag || "";
    this.doDrawTextPath = !!options.doDrawTextPath;
    this.isStatic = !!options.isStatic;

    // Position and movement
    this.position = createVector(options.x || 0, options.y || 0);
    this.desiredPosition = createVector(options.xDesired || 0, options.yDesired || 0);
    this.velocity = createVector(0, 0);
    this.rotation = options.rotation || 0;

    // Size
    this.defaultSize = options.size || 0;
    this.addedSize = 100;
    this.size = this.defaultSize;

    // Colors
    this.setColor(options.color === undefined ? color(random(colors)) : color(options.color));

    // Text path (if enabled)
    if (this.doDrawTextPath) {
      //this.textPath = font.getPath(this.text, 0, 0, this.defaultSize || 100);
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
    if (COLLISION_METHOD === 0) {
      if (
        this.position.x < oobBorders.left || this.position.x > width + oobBorders.right ||
        this.position.y < oobBorders.top || this.position.y > height + oobBorders.bottom
      ) {
        this.position.x = constrain(this.position.x, oobBorders.left, width + oobBorders.right);
        this.position.y = constrain(this.position.y, oobBorders.top, height + oobBorders.bottom);
      }
    }
    else if (COLLISION_METHOD === 1) {
      const forceRadius = (this.size * repulsionDistMult) / 2;

      if (
        this.position.x - forceRadius < oobBorders.left ||
        this.position.x + forceRadius > width + oobBorders.right ||
        this.position.y - forceRadius < oobBorders.top ||
        this.position.y + forceRadius > height + oobBorders.bottom
      ) {
        this.position.x = constrain(
        this.position.x,
        oobBorders.left + forceRadius,
        width + oobBorders.right - forceRadius
        );
        this.position.y = constrain(
        this.position.y,
        oobBorders.top + forceRadius,
        height + oobBorders.bottom - forceRadius
        );
      }
    }

    // Apply velocity to positionition
    this.velocity.limit(maxVelocity); // Limit the velocity to prevent excessive speed

    // Use a fixed decay factor for addedSize to avoid unnecessary calculations and reduce lag
    if (abs(this.addedSize) > 0.1) {
      this.addedSize *= 0.92;
    } else {
      this.addedSize = 0;
    }

    this.size = this.defaultSize + this.addedSize; // Update size based on distance to mouse

    if (doRotation) {
      const angle = atan2(this.velocity.y, this.velocity.x);
      this.rotation = angle + PI; // Update rotation based on velocity direction
    }

    if (!this.isStatic && this.doColision) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
    
    this.velocity.mult(1 - friction);
  }



  display() {
    
    //this.isStatic ? fill(255) : fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    
    push();
    translate(this.position.x, this.position.y);
    
    //rotateY(frameCount * 0.01);
    
    //translate(0, 0, -100);
    //translate(0, 0, sin(frameCount * 0.01 + this.position.x / width * 4) * 200); // Move the text up to avoid z-fighting with the ground plane
    
    //rotateX(PI / 2);
    //if (doRotation) rotate(this.rotation);
    
    //scale(mouseX / width);
    
    textAlign(CENTER, CENTER);
    textSize(this.size);
    text(this.text, 0, -this.size / 7);

    pop();

  }


  applyWaveEffect(wave, particlesOptions = {}) {
    const { text, size, color, addedSize } = particlesOptions; // Destructure options for text and size
    console.log(text, size, color, addedSize);

    if (!this.doColision) return; // Skip if not colliding
    this.addedSize = addedSize;

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

