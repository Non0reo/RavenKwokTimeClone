p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 0.2; // Multiplier for canvas size

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
  const aspectRatio = canvas.width / canvas.height;

  // Make the canvas take maximum space in either width or height, preserving aspect ratio
  let windowAspect = window.innerWidth / window.innerHeight;
  if (aspectRatio > windowAspect) {
    // Canvas is wider than window, fit width
    canvas.style('width', window.innerWidth + "px");
    canvas.style('height', (window.innerWidth / aspectRatio) + "px");
  } else {
    // Canvas is taller than window, fit height
    canvas.style('height', window.innerHeight + "px");
    canvas.style('width', (window.innerHeight * aspectRatio) + "px");
  }

  textFont(font);
  textSize(this.size);
  textAlign(CENTER, CENTER);
  //textStyle(BOLD); // Pre-calculate text width for better performance

  for (let i = 0; i < 700; i++) {
    textParticles.push(
      //new TextParticle( "00", width/2 + random(-10,10), height/2 + random(-10,10), defaultParticleSize )
      new TextParticle({
        text: "8",
        x: width / 2 + random(-10, 10),
        y: height / 2 + random(-10, 10),
        size: defaultParticleSize,
      })
    );
  }

  textParticles.push(
    //new TextParticle( "8", width/2 + random(-10,10), height/2 + random(-10,10), defaultParticleSize * 20, { isStatic: true, tag: "big", doColision: false } ),
    new TextParticle({
      text: "8",
      x: width / 2 + random(-10, 10),
      y: height / 2 + random(-10, 10),
      size: defaultParticleSize * 10,
      isStatic: true,
      tag: "big",
      doColision: false,
      textSizeAdded: 20,
    })
  );
  textParticles.push(
    //new Force( width / 2, height / 2+30, canvasSizeMultiplier * 500 ) // Add a force at the center of the canvas
    new Force({
      x: width / 2,
      y: height / 2 + 30,
      strength: canvasSizeMultiplier * 500,
      doColision: true,
    })
  )
}

function draw() {
  background(0);
  translate(-width / 2, -height / 2); // Center the text in the canvas

  let now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();

  if(mouseIsPressed) {
    /* textParticles.filter(e => e.tag == 'big').forEach(p => {
      p.position.set(mouseX, mouseY); // Center static particles
    }); */
    textParticles[textParticles.length - 1].position.set(mouseX, mouseY);
  }

  // Make every particle repel from each other
  for (let i = textParticles.length - 1; i >= 0; i--) {
    let particle = textParticles[i];
    
    // Repel from all other particles
    for (let j = 0; j < textParticles.length; j++) {
      if (i !== j) {

        //if(distSquared(particle.position.x, particle.position.y, textParticles[j].position.x, textParticles[j].position.y) < pow(particle.defaultSize * repulsionDistMult, 2)) {
        if(dist(particle.position.x, particle.position.y, textParticles[j].position.x, textParticles[j].position.y) < textParticles[j].defaultSize * repulsionDistMult) {
          particle.repulsion(textParticles[j]);
        }
      }
    }

    particle.update();
    particle.display(); 
    //particle.debugDisplay();
  }

  // Display all particles
  /* for (const particle of textParticles) {
    particle.update();
    particle.display();
  } */

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

