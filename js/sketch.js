p5.disableFriendlyErrors = true;

const canvasSizeMultiplier = 1; // Multiplier for canvas size
//const colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];
const colors = ['#f29538', '#edd42d', '#fc7419', '#ffff8c'];
const defaultParticleSize = canvasSizeMultiplier * 130; // Default size for new particles

let oobKill = {
  top: 0,
  bottom: defaultParticleSize / 2,
  left: 200,
  right: -200,
}
let repulsionDistMult = 1.3;
let debugMode = false; // Debug mode flag.
let remaningSeconds = 100; // Remaining seconds for timer
let temp_seconds, seconds;

let textParticles = [];
let forces = [];
let waves = [];

let canvas;
let buffer0;
let buffer1;
let buffer2;

let font;
let fontData;
let rawFont;
let maskImage;

/* let contentShader0, contentShader1, contentShader2;
let shader0, shader1, shader2; */

let shaderNames = ['background', 'glow', 'sobel'];
let shaders = [];

function preload() {
  fontData = loadBytes('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf');
  rawFont = loadFont('assets/font/barlow-1.422/ttf/BarlowCondensed-Bold.ttf');
  maskImage = loadImage('assets/images/GlobalTransparent.png');

  for (let i = 0; i < shaderNames.length; i++) {
    shaders.push({
      name: shaderNames[i],
      content: loadStrings(`../shaders/${shaderNames[i]}.frag`),
      s: null,
      filter: () => {
        filter(getShader(i));
      },
      
    });
  }
  
}

function setup() {
  //canvas = createCanvas(window.innerWidth * canvasSizeMultiplier, window.innerHeight * canvasSizeMultiplier, WEBGL);
  canvas = createCanvas(3600 * canvasSizeMultiplier, 3268 * canvasSizeMultiplier, WEBGL);
  buffer0 = createFramebuffer();
  buffer1 = createFramebuffer();
  buffer2 = createFramebuffer();

  /* for (let i = 0; i < shaders.length; i++) {
    shaders[i].s = createFilterShader( shaders[i].content.join('\n'));
  }

  //shader0 = loadShader('../shaders/shader.vert', '../shaders/shader.frag');
  
  
  shaders[1].s.setUniform('glow_size', 1);
  shaders[1].setUniform('glow_colour', [ 1, 1, 1 ]);
  shaders[1].setUniform('glow_intensity', 0.5);
  shaders[1].setUniform('glow_threshold', 0.3); */

  
    

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



  const circleForceCount = 5;

  for (let j = 0; j < circleForceCount; j++) {
    forces.push(
      new PointForce({
        x: width / 2,
        y: lerp(height/2 + 200, height, j / (circleForceCount - 1)), // Evenly distribute forces vertically
        size: canvasSizeMultiplier * 600,
      })
    );
  }

  textParticles.push(
    new TextParticle({
      text: "•",
      x: width / 2,
      y: height * 2,
      size: defaultParticleSize * 18,
      isStatic: true,
      doColision: false,
      tag: "main",
      doDrawTextPath: false,
    })
  );

  //setTextParticleCount(700, textParticles.find((element) => element.tag == "main").text);
  setTextParticleCount(450);
  // setTextParticleCount(700, "9");
  // repulsionDistMult = 3;

  textParticles.push(
    new TextParticle({
      text: "01:10:01",
      x: width / 2,
      y: 350,
      size: 800,
      isStatic: true,
      tag: "time",
      doColision: false,
      doDrawTextPath: false,
      color: "#010101"
    })
  );

  buildTextForces();
}


function mousePressed() {
  forces.push(
    new PointForce({
      x: mouseX,
      y: mouseY,
      size: defaultParticleSize * 3,
      doColision: true,
    })
  );
}


function draw() {
  /* repulsionDistMult = map(mouseX, 0, width, 0.5, 4); // Adjust repulsion distance multiplier based on mouse X position
  textParticles.forEach((particle) => {
    if (particle.tag !== "main") {
      particle.defaultSize = map(mouseY, 0, height, defaultParticleSize * 0, defaultParticleSize * 2);
    }
  }); */
  
  const now = new Date();
  seconds = now.getSeconds();

  if (temp_seconds !== seconds) {
    remaningSeconds--;
    //remaningSeconds to a XX:XX format
    const formatedTime = `${String(Math.floor((remaningSeconds % 3600) / 60)).padStart(2, '0')}:${String(remaningSeconds % 60).padStart(2, '0')}`;
    const particle = textParticles.find((element) => element.tag == "time")
    particle.text = formatedTime; // Update the time text particle
    particle.addedSize = 50; // Reset the added size to create a pulsing effect
    temp_seconds = seconds;
  }

  buffer0.begin();
  background(0);
  translate(-width / 2, -height / 2);

  //shader(shader0);
  

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

  //add velocity using mouse mouvement only for the near particles
  for (const particle of textParticles) {
    if (dist(mouseX, mouseY, particle.position.x, particle.position.y) < particle.defaultSize * 2) {
      particle.velocity.x += (mouseX - pmouseX) * 0.1; // Apply mouse movement to velocity
      particle.velocity.y += (mouseY - pmouseY) * 0.1; // Apply mouse movement to velocity
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
          particle1.applyForce(particle2);
        }
      }
    }
    particle1.update();
    if(particle1.tag !== 'time') particle1.display();
    //particle1.display();
    //particle1.debugDisplay();
  }

  debugCommands(); // Handle debug commands

  if (!debugMode) image(maskImage, 0, 0, width, height);
  else displayDebugInfo();

  //filter(shaders[0]);
  buffer0.end();



  buffer1.begin();
    background(0);
    translate(-width / 2, -height / 2);
    textParticles.find((element) => element.tag == "time").display();
    //filter(shader0);
    //filter(shader1);
    //filter(shaders[2]);
  buffer1.end();


  buffer2.begin();
    //getShader('glow').setUniform('buffer0', buffer0);
    //getShader('glow').setUniform('buffer1', buffer1);
    //filter(getShader('sobel'));
  buffer2.end();


  background(0);
  translate(-width/2, -height/2);
  
  image(buffer2, 0, 0);
  image(buffer1, 0, 0);
  image(buffer0, 0, 0);
  
}


function keyPressed() {
  if (key === 'w') startCountdown();
  if (key === 'q') {
    startCountdown();
    countdownNumber = 3;
  };
}

