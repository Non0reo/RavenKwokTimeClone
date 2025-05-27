const oob_kill = 50;
const maxParticles = 1000; // Maximum number of particles
const repulsionDistMult = 1.15;
const defaultParticleSize = 60; // Default size for new particles
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996']

let hours, minutes, seconds;
let textParticles = [];

function setup() {
  createCanvas(window.innerWidth / 2, window.innerHeight / 2);
  textFont('Vina Sans');
}

function draw() {
  background(0);

  const temp_seconds = seconds;

  let now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();

  if (temp_seconds !== seconds) {
    timeChanged(seconds);
  }
  /* if (frameCount % 60 === 0) {
    timeChanged(seconds);
  } */

  if (textParticles.length > maxParticles) {
    textParticles.splice(0, textParticles.length - maxParticles); // Limit the number of particles
  }

  let timeString = nf(hours, 2) + ':' + nf(minutes, 2) + ':' + nf(seconds, 2);
  let angle = map(seconds, 0, 60, 0, TWO_PI);
  
  fill(255);
  textSize(48);
  textAlign(LEFT, TOP);
  text(timeString, 0, 0);
  noStroke();

  let numberOfOperations = 0;
  // Make every particle repel from each other
  for (let i = textParticles.length - 1; i >= 0; i--) {
    let particle = textParticles[i];
    
    // Repel from all other particles
    for (let j = 0; j < textParticles.length; j++) {
      if (i !== j) {

        if(dist(particle.x, particle.y, textParticles[j].x, textParticles[j].y) < repulsionDistMult * particle.size) {
          particle.repulsion(textParticles[j]);
          numberOfOperations++;
        }
      }
    }

    particle.update();
    particle.display();
  }

  console.log(`Number of operations: ${numberOfOperations}`);
  
}


function timeChanged(second) {
  //background(50);
  const rand = random(-50, 50);

  for (let i = 0; i < 12; i++) {
    textParticles.push(
      new TextParticle( nf(second, 2), random(-oob_kill, width + oob_kill) , 3/4*height + rand , defaultParticleSize )
    );
  }

}

function keyPressed() {
  if (key === ' ') {
    textParticles = []; // Clear particles on spacebar press
  }
  if( key === 'a') timeChanged(seconds); // Trigger time change on 'a' key press
}


class TextParticle {
  constructor(text, x, y, size) {
    this.text = text;
    this.x = x;
    this.y = y;
    
    this.defaultSize = size;
    this.targetSize = size;
    this.size = size + 100;

    this.velocity = createVector(0, 0);

    const randomColor = color(random(colors));
    this.targetColor = randomColor;

    this.color = color(
      min(red(randomColor) + 100, 255),
      min(green(randomColor) + 100, 255),
      min(blue(randomColor) + 100, 255)
    );

  }

  //create a repulsion force from a point
  repulsion(point) {
    let pointDistance = dist(this.x, this.y, point.x, point.y);
    let pointAngle = atan2(this.y - point.y, this.x - point.x);

    //forces
    //let pointF = 0.1 / (pointDistance * pointDistance);
    let pointF = constrain(map(pointDistance, 0, this.size * repulsionDistMult, 10, 0), 0, 2);
    

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
    this.velocity.limit(1); // Limit the velocity to prevent excessive speed

    const sizeChange = constrain(map(dist(this.x, this.y, mouseX, mouseY), 0, 300, 0, this.defaultSize), 10, this.defaultSize);
    this.size = sizeChange; // Update size based on distance to mouse

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    

    //this.size += (this.targetSize - this.size) * 0.1; // Smoothly transition to target size
    
    this.color = lerpColor(this.color, this.targetColor, 0.15); // Smoothly transition to target color

    //this.velocity.set(0, 0); // Reset velocity after applying forces
    this.velocity.mult(map(sizeChange, 10, this.defaultSize, 0.98, 1.1)); // Dampen the velocity for smoother movement

    /* if (this.x < -oob_kill || this.x > width + oob_kill || this.y < -oob_kill || this.y > height + oob_kill) {
      textParticles.splice(textParticles.indexOf(this), 1);
    } */

    

  }

  display() {
    // fill(128, 0, 0); // Semi-transparent color for debugging
    // circle(this.x, this.y, this.size * repulsionDistMult); // Debugging circle
    fill(this.color);
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y);
  }
  
}