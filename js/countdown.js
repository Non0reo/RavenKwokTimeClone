/* let countdownNumber = 10; // Countdown starting number

let waveData = {
    radius: 0,
    targetedRadius: 1200,
    x: 0,
    y: 0,
}

console.log("Countdown started with number:", countdownNumber); */

/*
    A wave from the center if the screen that expands outward depending on time (grows at a linear rate while it's not ouside the screen).
    on it's path it calls the applyWaveEffect function on nearby particles.
*/
/* function waveEffect(x, y, rStart, rEnd) {
    waveData.x = x;
    waveData.y = y;
    waveData.radius = rStart;
    waveData.targetedRadius = rEnd;

    //requestAnimationFrame(waveEffectLoop); // Start the wave effect loop
}

function waveEffectLoop() {
    waveData.radius = lerp(waveData.radius, waveData.targetedRadius, 0.02); // Smoothly increase the wave radius
    noFill();
    stroke(255);
    circle(waveData.x, waveData.y, waveData.radius * 2); // Draw the wave circle

    // Apply the wave effect to particles next to the wave
    for (let particle of textParticles) {
        let distance = dist(particle.position.x, particle.position.y, waveData.x, waveData.y);
        if (distance < waveData.radius && distance > waveData.radius - 50) { // Check if particle is within the wave's radius
            particle.applyWaveEffect(particle, waveData.radius);
        }
    }
} */

let countdownNumber = 10;
let appliedSize = defaultParticleSize;

function summonDefaultWave() {
    let centerX = width / 2;
    let centerY = height / 2;
    let startRadius = 0;
    let endRadius = max(width, height) * 0.8; // Set the end radius to be a bit less than the screen size
    
    waves.push(new Wave(centerX, centerY, startRadius, endRadius)); // Create a new wave at the center of the screen
}

class Wave {
    constructor(x, y, rStart, rEnd, apOp) {
        this.x = x;
        this.y = y;
        this.radius = rStart;
        this.targetedRadius = rEnd;

        /* this.appliedOptions = {
            text: countdownNumber.toString(),
            size: appliedSize,
            color: undefined
        }; */
        this.appliedOptions = apOp || {
            text: countdownNumber.toString(),
            size: appliedSize,
            color: undefined
        };
    }

    update() {
        this.radius = lerp(this.radius, this.targetedRadius, 0.02); // Smoothly increase the wave radius

        // Apply the wave effect to particles next to the wave
        for (let particle of textParticles) {
            let distance = dist(particle.position.x, particle.position.y, this.x, this.y);
            if (distance < this.radius && distance > this.radius - lerp(this.radius / 4, 50, this.radius/this.targetedRadius)) { // Check if particle is within the wave's radius
                particle.applyWaveEffect(this, {
                    text: countdownNumber.toString(),
                    size: appliedSize,
                });
            }
        }

        //this.display(); // Display the wave circle

        // If the wave radius exceeds the end radius, remove the wave
        if (this.radius >= this.targetedRadius) {
            this.remove();
        }

    }

    display() {
        // Display the wave circle
        noFill();
        stroke(255);
        circle(this.x, this.y, this.radius * 2);
    }

    remove() { //Remove the wave from the array
        let index = waves.indexOf(this);
        if (index > -1) {
            waves.splice(index, 1);
        }
    }
        
}


let interval;

function startCountdown() {
    countdownNumber = 10; // Reset countdown number
    repulsionDistMult = 1.3; // Reset repulsion distance multiplier
    setTextParticleCount(450);
    Object.assign(
        textParticles.find((element) => element.tag == "main"),
        {
            text: countdownNumber.toString(),
            addedSize: 200,
            defaultSize: defaultParticleSize * 1
        }
    );

    interval = setInterval(() => {
        const mainTextParticle = textParticles.find((element) => element.tag == "main");
        const numberPosition = 0.29;
        

        if (countdownNumber > 1) {
            countdownNumber--;
            repulsionDistMult = 1.4;

            Object.assign(
                textParticles.find((element) => element.tag == "main"),
                {
                    text: countdownNumber.toString(),
                    addedSize: 200,
                    defaultSize: defaultParticleSize * 18,
                    position: createVector(
                        //width / 2 + (countdownNumber % 2 * width * numberPosition * 2 - width * numberPosition), // Offset the text particle horizontally based on the countdown number
                        width / 2 + (width * numberPosition * (countdownNumber % 2 ? 1 : -1)), // Offset the text particle horizontally based on the countdown number
                        3/4 * height
                    ), // Center the text particle
                }
            );

            textParticles.find((element) => element.tag == "main").setColor(color(random(colors)));
            const endRadius = Math.hypot(width/2, height/2) * map(dist(mainTextParticle.position.x, mainTextParticle.position.y, width/2, height/2), 0, width/2, 1, 2);
            waves.push(new Wave(mainTextParticle.position.x, mainTextParticle.position.y, 0, endRadius, {
                text: countdownNumber.toString(),
                size: defaultParticleSize * 1,
            }));

            buildTextForces();
        } 
        else {
            clearInterval(interval); // Stop the countdown when it reaches zero
            countdownNumber = 2026;
            repulsionDistMult = 1.6;
             setTextParticleCount(400);
            
            Object.assign(
                textParticles.find((element) => element.tag == "main"),
                {
                    text: countdownNumber.toString(),
                    addedSize: defaultParticleSize * (18 - 11),
                    defaultSize: defaultParticleSize * 11,
                    position: createVector(
                        width / 2, // Offset the text particle horizontally based on the countdown number
                        height / 5
                    ), //
                }
            );
            textParticles.find((element) => element.tag == "main").setColor(color(colors[2])); // Reset color to the first color in the array

            const endRadius = Math.hypot(width/2, height/2) * map(dist(mainTextParticle.position.x, mainTextParticle.position.y, width/2, height/2), 0, width/2, 1, 2);
            waves.push(new Wave(mainTextParticle.position.x, mainTextParticle.position.y, 0, endRadius, {
                text: countdownNumber.toString(),
                size: defaultParticleSize * 1,
            }));
            buildTextForces();
        }
    }, 1500); // Update every second
}