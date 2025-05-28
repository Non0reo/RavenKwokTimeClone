class TextParticle {
  constructor(text, x, y, size) {
    this.text = text;
    this.x = x;
    this.y = y;
    
    this.defaultSize = size;
    this.addedSize = 100;
    this.targetSize = size;
    this.size = size;

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
    let pointDistance = dist(this.x, this.y, point.x, point.y);
    let pointAngle = atan2(this.y - point.y, this.x - point.x);

    let pointF = constrain(map(pointDistance, 0, this.defaultSize * repulsionDistMult, 10, 0), 0, 2);
    

    this.velocity.x += pointF * cos(pointAngle);
    this.velocity.y += pointF * sin(pointAngle);
 
  }

  update() {
    //prevent particles from going out of bounds without killing them
    if (this.x < -oob_kill || this.x > width + oob_kill || this.y < -oob_kill || this.y > height + oob_kill) {
      this.x = constrain(this.x, -oob_kill, width + oob_kill);
      this.y = constrain(this.y, -oob_kill, height + oob_kill);
    }

    // Apply velocity to position
    //this.velocity.limit(5); // Limit the velocity to prevent excessive speed

    //const radiusPostion = dist(this.x, this.y, frameCount % width, height/4);



    

    // Use a fixed decay factor for addedSize to avoid unnecessary calculations and reduce lag
    if (abs(this.addedSize) > 0.1) {
      this.addedSize *= 0.92;
    } else {
      this.addedSize = 0;
    }
    //this.addedSize = lerp(this.addedSize, 0, 0.1); // Smoothly transition to target size

    /* this.size += this.addedSize; */

    //const sizeChange = constrain(map(radiusPostion, 0, this.defaultSize * 5, 0, this.defaultSize), this.defaultSize / 8 , this.defaultSize);
    this.size = /* sizeChange */this.defaultSize + this.addedSize; // Update size based on distance to mouse

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    //this.color = lerpColor(this.color, this.targetColor, 0.15); // Smoothly transition to target color

    //this.velocity.set(0, 0); // Reset velocity after applying forces
    //this.velocity.mult(map(sizeChange, this.defaultSize / 3, this.defaultSize, 0.98, 1.0)); // Dampen the velocity for smoother movement
    //this.velocity.set(0, 0);
    //this.velocity.mult(0.8); // Dampen the velocity for smoother movement
    //this.velocity.mult(map(sizeChange, this.defaultSize / 3, this.defaultSize, 1.0, 0.8));

    /* const inMouseRadius = radiusPostion < this.defaultSize * 5;
    if (inMouseRadius) {
      this.velocity.mult(0.8); // Dampen the velocity for smoother movement
    } else {
      this.velocity.mult(0.8); // Slightly less damping when not near the mouse
    } */
    this.velocity.mult(0.8);

    /* if (this.x < -oob_kill || this.x > width + oob_kill || this.y < -oob_kill || this.y > height + oob_kill) {
      textParticles.splice(textParticles.indexOf(this), 1);
    } */

    

  }

  display() {
    // fill(128, 0, 0); // Semi-transparent color for debugging
    // circle(this.x, this.y, this.size * repulsionDistMult); // Debugging circle
    //fill(this.color);
    fill(lerpColor(this.defaultColor, this.brightColor, this.addedSize / 100));
    textSize(this.size);
    text(this.text, this.x, this.y);
  }

  debugDisplay() {
    //draw velocity vector arrow
    stroke(255, 0, 0);
    strokeWeight(2);
    line(this.x, this.y, this.x + this.velocity.x * 10, this.y + this.velocity.y * 10);
    noStroke();
    fill(255, 0, 0);
    circle(this.x, this.y, 5); // Draw a small circle at the particle's position
  }
  
}