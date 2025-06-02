p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 1; // Multiplier for canvas size

const defaultParticleSize = canvasSizeMultiplier * 120; // Default size for new particles
//const oobKill = - defaultParticleSize / 2;
const oobKill = {
  width: defaultParticleSize / 2 - 200,
  height: defaultParticleSize / 2
}
const maxParticles = 300; // Maximum number of particles
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];
let repulsionDistMult = 1.3;


let hours, minutes, seconds;
let temp_seconds, temp_minutes, temp_hours;
let textParticles = [];
let forces = []; // Array to hold Force objects
let waves = []; // Array to hold Wave objects

let canvas;
let font;
let fontData;
let rawFont;
let maskImage;

function preload() {
  fontData = loadBytes('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf'); // Use a bold font for better visibility
  rawFont = loadFont('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf'); // Load the font for text rendering
  maskImage = loadImage('assets/images/GlobalTransparent.png'); // Load the mask image
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

  font = opentype.parse(fontData.bytes.buffer);
  console.log("Font loaded:", font);

  textFont(rawFont);
  textSize(this.size);
  textAlign(CENTER, CENTER);
  //textStyle(BOLD); // Pre-calculate text width for better performance

  textParticles.push(
    new TextParticle({
      text: "9",
      x: width / 2,
      y: height * 2,
      size: defaultParticleSize * 18,
      isStatic: true,
      tag: "main",
      doColision: false,
      doDrawTextPath: false,
    })
  );

  setTextParticleCount(450);



  /* forces.push(
    new RectangleForce({
      x: width / 2,
      y: height / 2 + 20,
      width: canvasSizeMultiplier * 1200,
      height: canvasSizeMultiplier * 1900,
      doColision: true,
      fromCenter: true,
    })
  ); */

  const circleForceCount = 5; // Number of circular forces
  const numChars = textParticles.find((element) => element.tag == "main").text.length; // Number of characters in the main text particle

  for (let j = 0; j < circleForceCount; j++) {
    forces.push(
      new PointForce({
        x: width / 2,
        y: lerp(height/2 + 100, height, j / (circleForceCount - 1)), // Evenly distribute forces vertically
        strength: canvasSizeMultiplier * 600,
        doColision: true,
      })
    );
  }

  //buildTextForces(); // Build forces around the text particles
}


/* function mousePressed() {
  forces.push(
    new PointForce({
      x: mouseX,
      y: mouseY,
      strength: canvasSizeMultiplier * 800,
      doColision: true,
    })
  );
} */


function draw() {
  background(0);
  translate(-width / 2, -height / 2); // Center the text in the canvas

  //textParticles.find((element) => element.tag == "main").position.set(mouseX, mouseY); // Set the main text particle to follow the mouse position

  let now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();


  //make every particle repel from the forces
  for (const force of forces) {
    for (const particle of textParticles) {

      if (force instanceof PointForce) {
        force.applyForce(particle); // Apply repulsion force to the particle
      }
      else if (force instanceof RectangleForce) {
        // Check if the particle is within the rectangle area
        if (particle.position.x > force.position.x - force.area.x / 2 &&
            particle.position.x < force.position.x + force.area.x / 2 &&
            particle.position.y > force.position.y - force.area.y / 2 &&
            particle.position.y < force.position.y + force.area.y / 2) {
          force.applyForce(particle);
        }
      }

    }
  }

  waves.forEach(wave => {
    wave.update(); // Update each wave
  });



  // Make every particle repel from each other
  for (const particle1 of textParticles) {
    for (const particle2 of textParticles) {
      if (particle1 !== particle2) {
        if (dist(particle1.position.x, particle1.position.y, particle2.position.x, particle2.position.y) < particle2.defaultSize * repulsionDistMult) {
          particle1.repulsion(particle2);
        }
      }
    }
    particle1.update();
    particle1.display();
    //particle1.debugDisplay();
  }

  // Display all particles
  // for (const particle of textParticles) {
  //   particle.update();
  //   particle.display();
  // }

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

  image(maskImage, 0, 0, width, height); // Draw the mask image
}





function timeChanged(second) {
  //background(50);

}

function minuteEvent() {
  //background(255, 0, 0);

}

function keyPressed() {
  if (key === 'a') timeChanged(seconds); // Trigger time change on 'a' key press
  if (key === 'q') minuteEvent(); // Trigger minute event on 's' key press
}

