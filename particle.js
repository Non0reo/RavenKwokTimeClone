class TextParticle {
  constructor(text, x, y, size, options) {
    this.text = text;
    this.options = options || {};
    this.isStatic = this.options.isStatic || false; // If true, the particle will not move
    this.tag = this.options.tag || ""; // Optional tag for the particle

    this.defaultSize = size;
    this.addedSize = 100;
    this.targetSize = size;
    this.size = size;

    this.position = createVector(x, y);
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

    if (!this.isStatic) {
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
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.text, this.position.x, this.position.y);
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