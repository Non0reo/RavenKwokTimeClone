const canvasSizeMultiplier = 1; // Multiplier for canvas size

const oob_kill = canvasSizeMultiplier * 50;
const maxParticles = 300; // Maximum number of particles
const repulsionDistMult = canvasSizeMultiplier * 1.5;
const defaultParticleSize = canvasSizeMultiplier * 60; // Default size for new particles
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];


let hours, minutes, seconds;
let textParticles = [];

let canvas;
let font;

function preload() {
  //font = loadFont('assets/font/Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf'); // Uncomment if you have a custom font
  //font = loadFont('assets/font/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf');
  font = loadFont('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf'); // Use a bold font for better visibility
}

function setup() {
  canvas = createCanvas(window.innerWidth * canvasSizeMultiplier, window.innerHeight * canvasSizeMultiplier, WEBGL);
  textFont(font);
  //set size of canvas to half of the window size
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  textSize(this.size);
  //textStyle(BOLD); // Pre-calculate text width for better performance

}

function draw() {
  background(0);
  translate(-width / 2, -height / 2); // Center the text in the canvas

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