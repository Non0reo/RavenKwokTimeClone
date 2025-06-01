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
        text(`FPS: ${frameRate().toFixed(2)}`, 10, 60);
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
                for (const particle of textParticles) {
                    if (particle instanceof Force) {
                        particle.debugDisplay();
                    }
                }
                
        }
    }
}