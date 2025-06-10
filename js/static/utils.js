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
        //text(`Time: ${nf(hours, 2)}:${nf(minutes, 2)}:${nf(seconds, 2)}`, 10, 0);
        text(`Particles: ${textParticles.length}`, 10, 30);
        text(`(+ Forces: ${forces.length})`, 10, 60);
        text(`FPS: ${frameRate().toFixed(2)}`, 10, 90);
    pop();
}

function debugCommands() {
    if(keyIsPressed) {
        switch (key) {
            case ' ':
                textParticles = []; // Clear particles on spacebar press
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
                
                debugMode = true;
            
                break;

            case 'f':
                for (const particle of textParticles) {
                    if (particle instanceof TextParticle) {
                        particle.debugDisplay();
                    }
                }
                break;
        }
    }
    else debugMode = false; // Reset debug mode when no key is pressed
}





function buildTextForces(spreadX = 1.0, spreadY = 0.16, size = 630) {
    forces.filter((force) => force.tag === 'text').forEach((force) => force.remove()); // Remove existing text forces
    
    const mainTextParticle = textParticles.find((element) => element.tag == "main");
    const circleForceCount = 5; // Number of circular forces
    const numChars = mainTextParticle.text.length; // Number of characters in the main text particle



    for (let i = 0; i < numChars * 2; i++) {
        for (let j = 0; j < circleForceCount; j++) {
            forces.push(
                new PointForce({
                    x: mainTextParticle.position.x + (i + 0.5 - numChars) * (defaultParticleSize * numChars / 2 * spreadX), // Evenly distribute forces horizontally based on character index
                    y: lerp( mainTextParticle.position.y - mainTextParticle.defaultSize * spreadY, mainTextParticle.position.y + mainTextParticle.defaultSize * spreadY, j / (circleForceCount - 1)), // Evenly distribute forces vertically
                    size: canvasSizeMultiplier * size,
                    tag: 'text'
                })
            );
        }
    }
    /* forces.push(
        new RectangleForce({
            x: mainTextParticle.position.x,
            y: mainTextParticle.position.y ,
            width: mainTextParticle.defaultSize * numChars * 0.5,
            height: mainTextParticle.defaultSize * 1.2,//* 0.7,
            tag: 'text',
            fromCenter: true
        })
    ) */
}



function setTextParticleCount(count, textIn = "•") {

    // Calculate the number of particles to add
    const particlesToAdd = count - textParticles.length;

    if (particlesToAdd > 0) {
        for (let i = 0; i < particlesToAdd; i++) {
            textParticles.push(
                new TextParticle({
                    text: textIn,
                    x: width / 2 + random(-10,10),
                    y: height / 2 + random(-10,10),
                    // x: random(width),
                    // y: random(height),
                    size: defaultParticleSize,
                    //size: random(defaultParticleSize * 0.5, defaultParticleSize * 1),
                })
            );
        }
    } else if (particlesToAdd < 0) {
        // Remove only particles with no tags until the desired count is reached
        let toRemove = Math.abs(particlesToAdd);
        // Sort particles without tags by their y position (bottommost first)
        let removable = textParticles
            .map((p, i) => ({ p, i }))
            .filter(obj => !obj.p.tag)
            .sort((a, b) => b.p.position.y - a.p.position.y);

        for (let j = 0; j < toRemove && j < removable.length; j++) {
            textParticles.splice(removable[j].i, 1);
            // Adjust indices of remaining items since splice mutates the array
            for (let k = j + 1; k < removable.length; k++) {
            if (removable[k].i > removable[j].i) removable[k].i--;
            }
        }
    }
}


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