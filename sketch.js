p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 1; // Multiplier for canvas size

const oob_kill = canvasSizeMultiplier * 1 - 30;
const maxParticles = 300; // Maximum number of particles
const repulsionDistMult = canvasSizeMultiplier * 1.1;
const defaultParticleSize = canvasSizeMultiplier * 30; // Default size for new particles
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];


let hours, minutes, seconds;
let temp_seconds, temp_minutes, temp_hours;
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
  textAlign(CENTER, CENTER);
  //textStyle(BOLD); // Pre-calculate text width for better performance

}

function draw() {
  background(0);
  translate(-width / 2, -height / 2); // Center the text in the canvas




  let now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();


  
  /* if (frameCount % 60 === 0) {
    timeChanged(seconds);
  } */



  // Make every particle repel from each other
  for (let i = textParticles.length - 1; i >= 0; i--) {
    let particle = textParticles[i];
    
    // Repel from all other particles
    for (let j = 0; j < textParticles.length; j++) {
      if (i !== j) {

        if(distSquared(particle.x, particle.y, textParticles[j].x, textParticles[j].y) < pow(particle.defaultSize * repulsionDistMult, 2)) {
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


  //console.log(`Number of operations: ${numberOfOperations}`);
  
  displayDebugInfo(); // Display debug information
  debugCommands(); // Handle debug commands
}


function timeChanged(second) {
  //background(50);
  const rand = random(-50, 50);

  for (let i = 0; i < 5; i++) {
    textParticles.push(
      new TextParticle( nf(second, 2), random(-oob_kill, width + oob_kill) , 3/4*height + rand , defaultParticleSize )
    );
  }
}

function minuteEvent() {
  background(255, 0, 0);
  
  if (textParticles.length > maxParticles) {
    // Randomly remove N particles from anywhere in the array
    const N = (textParticles.length - maxParticles) + maxParticles * 0.5;
    for (let i = 0; i < N; i++) {
      const idx = floor(random(textParticles.length));
      textParticles.splice(idx, 1);
    }
  }

  textParticles.forEach(element => {
    element.addedSize = 100; // Increase size of all particles

    //random high velocity
    /* element.velocity.x = random(-50, 50);
    element.velocity.y = random(-50, 50); */
    //random high velocity from the center of the canvas
    const angleFromCenter = atan2(element.y - height / 2, element.x - width / 2);

    element.velocity.x = cos(angleFromCenter);
    element.velocity.y = sin(angleFromCenter);

    element.velocity.mult(map(distSquared(element.x, element.y, width / 2, height / 2), 0, pow(width, 2), 20, 0)); // Scale velocity based on distance from center
  });
}

function keyPressed() {
  if( key === 'a') timeChanged(seconds); // Trigger time change on 'a' key press
  if (key === 'q') minuteEvent(); // Trigger minute event on 's' key press
}

