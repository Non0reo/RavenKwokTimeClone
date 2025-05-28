p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 1; // Multiplier for canvas size

const defaultParticleSize = canvasSizeMultiplier * 100; // Default size for new particles
const oob_kill = defaultParticleSize / 2;
const maxParticles = 300; // Maximum number of particles
const repulsionDistMult = 1.3;
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];


let hours, minutes, seconds;
let temp_seconds, temp_minutes, temp_hours;
let textParticles = [];

let canvas;
let font;

function preload() {
  font = loadFont('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf'); // Use a bold font for better visibility
}

function setup() {
  //canvas = createCanvas(window.innerWidth * canvasSizeMultiplier, window.innerHeight * canvasSizeMultiplier, WEBGL);
  canvas = createCanvas(3600 * canvasSizeMultiplier, 3268 * canvasSizeMultiplier, WEBGL);
  textFont(font);
  //set size of canvas to half of the window size
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  textSize(this.size);
  textAlign(CENTER, CENTER);
  //textStyle(BOLD); // Pre-calculate text width for better performance

  for (let i = 0; i < 300; i++) {
    textParticles.push(
      new TextParticle( "00", width/2 + random(-10,10), height/2 + random(-10,10), defaultParticleSize )
    );
  }
}

function draw() {
  background(0);
  translate(-width / 2, -height / 2); // Center the text in the canvas


  let now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();


  // Make every particle repel from each other
  for (let i = textParticles.length - 1; i >= 0; i--) {
    let particle = textParticles[i];
    
    // Repel from all other particles
    for (let j = 0; j < textParticles.length; j++) {
      if (i !== j) {

        if(distSquared(particle.position.x, particle.position.y, textParticles[j].position.x, textParticles[j].position.y) < pow(particle.defaultSize * repulsionDistMult, 2)) {
          particle.repulsion(textParticles[j]);
        }
      }
    }

    particle.update();
    particle.display();
    //particle.debugDisplay();
  }

  if (temp_seconds !== seconds) {
    timeChanged(seconds);
    temp_seconds = seconds;

    if (temp_minutes !== minutes) {
      minuteEvent();
      temp_minutes = minutes;
    }
  }

  displayDebugInfo(); // Display debug information
  debugCommands(); // Handle debug commands
}


function timeChanged(second) {
  //background(50);

}

function minuteEvent() {
  //background(255, 0, 0);

}

function keyPressed() {
  if( key === 'a') timeChanged(seconds); // Trigger time change on 'a' key press
  if (key === 'q') minuteEvent(); // Trigger minute event on 's' key press
}

