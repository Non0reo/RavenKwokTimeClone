//optimization function to calculate squared distance
function distSquared(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
}

function displayDebugInfo() {
    push();
        fill(255);
        textSize(30);
        textAlign(LEFT, TOP); 
        text(`Time: ${nf(hours, 2)}:${nf(minutes, 2)}:${nf(seconds, 2)}`, 10, 0);
        text(`Particles: ${textParticles.length}`, 10, 30);
        text(`(+ Forces: ${forces.length})`, 10, 60);
        text(`FPS: ${frameRate().toFixed(2)}`, 10, 90);
    pop();
}

/*   if (key === ' ') {
    textParticles = []; // Clear particles on spacebar press
  }
  if( key === 'a') timeChanged(seconds); // Trigger time change on 'a' key press
  if (key === 'q') minuteEvent(); // Trigger minute event on 's' key press */

function debugCommands() {
    if(keyIsPressed) {
        switch (key) {
            case ' ':
                textParticles = []; // Clear particles on spacebar press
                break;
            case 'z':
                timeChanged(seconds); // Trigger time change on 'a' key press
                break;
            case 's':
                minuteEvent(); // Trigger minute event on 'q' key press
                break;
            case 'd':
                //display the force cicle for all Force objects in the textParticles array
                for (const force of forces) {
                    if (force instanceof Force) {
                        force.debugDisplay();
                    }
                }

                push();
                    resetMatrix(); // Reset the transformation matrix
                    strokeWeight(5);
                    stroke(0, 0, 255);
                    line(0, -height / 2, 0, height / 2); // Vertical line
                    line(-width / 2, 0, width / 2, 0); // Horizontal line
                pop();
            
                break;

            case 'f':
                image(maskImage, 0, 0, width, height);
                break;
        }
    }
}


function buildTextForces() {
    forces.filter((force) => force.tag === 'text').forEach((force) => force.remove()); // Remove existing text forces
    
    const mainTextParticle = textParticles.find((element) => element.tag == "main");
    const circleForceCount = 5; // Number of circular forces
    const numChars = mainTextParticle.text.length; // Number of characters in the main text particle



    for (let i = 0; i < numChars * 2; i++) {
        for (let j = 0; j < circleForceCount; j++) {
            forces.push(
                new PointForce({
                    x: mainTextParticle.position.x + (i + 0.5 - numChars) * (defaultParticleSize * numChars / 2), // Evenly distribute forces horizontally based on character index
                    y: lerp( mainTextParticle.position.y - mainTextParticle.defaultSize / 6, mainTextParticle.position.y + mainTextParticle.defaultSize / 6, j / (circleForceCount - 1)), // Evenly distribute forces vertically
                    strength: canvasSizeMultiplier * 630,
                    doColision: true,
                    tag: 'text'
                })
            );
        }
    }
}



function setTextParticleCount(count) {
    const mainTextParticle = textParticles.find((element) => element.tag == "main");

    // Calculate the number of particles to add
    const particlesToAdd = count - textParticles.length;

    if (particlesToAdd > 0) {
        for (let i = 0; i < particlesToAdd; i++) {
            textParticles.push(
                new TextParticle({
                    text: mainTextParticle.text,
                    x: random(width),
                    y: random(height),
                    size: defaultParticleSize,
                })
            );
        }
    } else if (particlesToAdd < 0) {
        // Remove only particles with no tags until the desired count is reached
        let toRemove = Math.abs(particlesToAdd);
        for (let i = textParticles.length - 1; i >= 0 && toRemove > 0; i--) {
            if (!textParticles[i].tag) {
                textParticles.splice(i, 1);
                toRemove--;
            }
        }
    }
}