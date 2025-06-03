p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 1; // Multiplier for canvas size
const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];
const defaultParticleSize = canvasSizeMultiplier * 120; // Default size for new particles
const oobKill = {
  width: defaultParticleSize / 2 - 250,
  height: defaultParticleSize / 2
}

let repulsionDistMult = 1.3;
let debugMode = false; // Debug mode flag

let textParticles = [];
let forces = [];
let waves = [];

let canvas;
let font;
let fontData;
let rawFont;
let maskImage;
let shaderContent
let styleShader;

function preload() {
  fontData = loadBytes('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf');
  rawFont = loadFont('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf');
  maskImage = loadImage('assets/images/GlobalTransparent.png');
  shaderContent = loadStrings('../shaders/glow.frag');
}

function setup() {
  //canvas = createCanvas(window.innerWidth * canvasSizeMultiplier, window.innerHeight * canvasSizeMultiplier, WEBGL);
  canvas = createCanvas(3600 * canvasSizeMultiplier, 3268 * canvasSizeMultiplier, WEBGL);
  //styleShader = loadShader('../shaders/shader.vert', '../shaders/shader.frag'); // Load the shader
  styleShader = createFilterShader(shaderContent.join('\n')); 
  styleShader.setUniform('glow_size', 0.5);
  styleShader.setUniform('glow_colour', [ 1, 1, 1 ]);
  styleShader.setUniform('glow_intensity', 1);
  styleShader.setUniform('glow_threshold', 0.5);
    
  // Responsive canvas sizing: fit to window while preserving aspect ratio
  function resizeCanvasToWindow() {
    const aspectRatio = width / height;
    const windowAspect = window.innerWidth / window.innerHeight;

    if (aspectRatio > windowAspect) {
      // Fit width
      canvas.style('width', window.innerWidth + 'px');
      canvas.style('height', (window.innerWidth / aspectRatio) + 'px');
    } else {
      // Fit height
      canvas.style('height', window.innerHeight + 'px');
      canvas.style('width', (window.innerHeight * aspectRatio) + 'px');
    }
  }

  resizeCanvasToWindow();
  window.addEventListener('resize', resizeCanvasToWindow);

  font = opentype.parse(fontData.bytes.buffer);
  console.log("Font loaded:", font);

  textFont(rawFont);
  textSize(this.size);
  textAlign(CENTER, CENTER);

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



  const circleForceCount = 5;
  const numChars = textParticles.find((element) => element.tag == "main").text.length;

  for (let j = 0; j < circleForceCount; j++) {
    forces.push(
      new PointForce({
        x: width / 2,
        y: lerp(height/2 + 200, height, j / (circleForceCount - 1)), // Evenly distribute forces vertically
        strength: canvasSizeMultiplier * 600,
        doColision: true,
      })
    );
  }

  //buildTextForces();
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
  translate(-width / 2, -height / 2);

  //shader(styleShader);
  

  //textParticles.find((element) => element.tag == "main").position.set(mouseX, mouseY); // Set the main text particle to follow the mouse position

  //make every particle repel from the forces
  for (const force of forces) {
    for (const particle of textParticles) {

      if (force instanceof PointForce) {
        force.applyForce(particle);
      } else if (force instanceof RectangleForce) {
        const { x, y } = particle.position;
        const { x: fx, y: fy } = force.position;
        const { x: fw, y: fh } = force.area;
        if (
          x > fx - fw / 2 &&
          x < fx + fw / 2 &&
          y > fy - fh / 2 &&
          y < fy + fh / 2
        ) {
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
    //if(particle1.tag !== 'main') particle1.display();
    particle1.display();
    //particle1.debugDisplay();
  }

  // Display all particles
  // for (const particle of textParticles) {
  //   particle.update();
  //   particle.display();
  // }


  debugCommands(); // Handle debug commands

  if (!debugMode) image(maskImage, 0, 0, width, height);
  else displayDebugInfo();

  styleShader.setUniform('u_mouse', [mouseX, mouseY]);
  filter(styleShader);
}


function keyPressed() {
  if (key === 'w') startCountdown();
  if (key === 'q') {
    startCountdown();
    countdownNumber = 3;
  };
}

