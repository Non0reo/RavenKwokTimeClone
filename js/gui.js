let canvasSizeMultiplier = 1; // Multiplier for canvas size
let colors = ['#f29538', '#edd42d', '#fc7419', '#ffff8c'];
let defaultParticleSize = canvasSizeMultiplier * 130; // Default size for new particles
let friction = 0.2; // Friction applied to particles
let particleCount = 450; // Number of particles to generate
let particleText = "<3"; // Default text for particles
let maxVelocity = 50; // Maximum velocity for particles

let oobBorders = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
}

let dimensions = {
    width: 3600,
    height: 3268
};

let repulsionDistMult = 1.3;
let debugMode = false;





let gui = new dat.GUI({
    name: 'Controls',
    hidable: true,
    width: 300
});
gui.useLocalStorage = true; // Enable local storage to save GUI state



let canvasFolder = gui.addFolder('Canvas');
let colorsFolder = gui.addFolder('Colors');
let particleFolder = gui.addFolder('Particles');
let otherFolder = gui.addFolder('Other');

/* CANVAS */
canvasFolder.add(dimensions, 'width').name('Canvas Width').onFinishChange((value) => {
    dimensions.width = value;
    console.log('Canvas width changed to:', value);
    resizeCanvas(value * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
}).listen();

canvasFolder.add(dimensions, 'height').name('Canvas Height').onFinishChange((value) => {
    dimensions.height = value;
    console.log('Canvas height changed to:', value);
    resizeCanvas(dimensions.width * canvasSizeMultiplier, value * canvasSizeMultiplier);
    resizeCanvasToWindow();
}).listen();

canvasFolder.add({click: () => {
    dimensions.width = 3600;
    dimensions.height = 3268;
    resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
    console.log('Canvas size reset to default:', dimensions.width, 'x', dimensions.height);
}}, 'click').name('Reset Canvas Size');

canvasFolder.add({value: canvasSizeMultiplier}, 'value', 0.1, 2, 0.1).name('Canvas Size Multiplier').onFinishChange((value) => {
    // Update the canvas size multiplier and resize the canvas
    canvasSizeMultiplier = value;
    console.log('Canvas size multiplier changed to:', value);
    resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
}).listen();


// Out of Bounds Borders controls
let oobBordersFolder = canvasFolder.addFolder('Out of Bounds Borders');
const borderConfigs = [
    { key: 'top',    label: 'Top Border',    min: -dimensions.height, max: dimensions.height },
    { key: 'bottom', label: 'Bottom Border', min: -dimensions.height, max: dimensions.height },
    { key: 'left',   label: 'Left Border',   min: -dimensions.width,  max: dimensions.width  },
    { key: 'right',  label: 'Right Border',  min: -dimensions.width,  max: dimensions.width  }
];

borderConfigs.forEach(({ key, label, min, max }) => {
    oobBordersFolder.add(oobBorders, key, min, max)
        .name(label)
        .onFinishChange(value => { oobBorders[key] = value; })
        .listen();
});


/* COLORS */
let sliderColor = colorsFolder.add({value: colors.length}, 'value', 0, 10, 1).name('Number of Color').onChange((value) => {
    //set the length of colors array to value and fill it with random colors, add color to the gui so they can be changed
    
    if(value === colors.length) return; // No change if the value is the same as the current length
    if (value < colors.length) {
        colors = colors.slice(0, value);
    } else {
        for (let i = colors.length; i < value; i++) {
            // Generate a 6-digit hex color code
            let hex = Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
            colors.push('#' + hex);
        }
    }
    
    addColors();
});


function addColors() {
    colorsFolder.__controllers.filter(controller => controller.property !== 'value').forEach(controller => {
        controller.remove();
    });

    const palette = { ...colors};
    for (let i = 0; i < colors.length; i++) {
        const colorKey = `color${i + 1}`;
        palette[colorKey] = colors[i];
        
        colorsFolder.addColor(palette, colorKey).name(`Color ${i + 1}`).onChange((value) => {
            colors[i] = value; // Update the colors array with the new value
            console.log(`Color ${i + 1} changed to:`, value);
        });
    }
}
addColors();


/* PARTICLES */
particleFolder.add({respawn: () => {
    textParticles = [];
    setTextParticleCount(particleCount);
}}, 'respawn').name('Respawn Particles');

particleFolder.add({value: particleText}, 'value').name('Particle Text').onChange((value) => {
    particleText = value;
    textParticles.forEach((particle) => {
        if (particle.tag !== "main") {
            particle.text = particleText; // Update text for all particles except the main one
        }
    });
}).listen();

particleFolder.add({value: particleCount}, 'value', 0, 1000, 1).name('Particle Count').onChange((value) => {
    respawnParticles()
}).listen();

particleFolder.add({value: defaultParticleSize}, 'value', 10, 500, 1).name('Default Particle Size').onFinishChange((value) => {
    defaultParticleSize = value;
    respawnParticles()
}).listen();

particleFolder.add({value: repulsionDistMult}, 'value', 0.1, 5, 0.1).name('Repulsion Distance Multiplier').onChange((value) => {
    repulsionDistMult = value;
}).listen();

particleFolder.add({value: friction}, 'value', 0, 1, 0.01).name('Particle Friction').onChange((value) => {
    friction = value;
}).listen();

particleFolder.add({value: maxVelocity}, 'value', 0, 50, 0.01).name('Particle Max Velocity').onChange((value) => {
    maxVelocity = value;
}).listen();

//toggle mouse collision
particleFolder.add({toggleMouseCollision: () => {
    forces.forEach(force => {
        if (force instanceof PointForce) {
            force.doColision = !force.doColision; // Toggle collision for all PointForce instances
        }
    });
}}, 'toggleMouseCollision').name('Toggle Mouse Collision');


/* OTHER */
otherFolder.add({debug: () => {
    debugMode = !debugMode;
}}, 'debug').name('Toggle Debug Mode');

otherFolder.add({saveData: () => {
    const data = {
        Canvas: {
            width: dimensions.width,
            height: dimensions.height,
            'Canvas Size Multiplier': canvasSizeMultiplier,
            'Out of Bounds Borders': { ...oobBorders }
        },
        Colors: {
            colors: colors.slice()
        },
        Particles: {
            'Particle Text': particleText,
            'Particle Count': particleCount,
            'Default Particle Size': defaultParticleSize,
            'Repulsion Distance Multiplier': repulsionDistMult,
            'Particle Friction': friction,
            'Particle Max Velocity': maxVelocity
        }
    };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert("Parameters copied to clipboard!");
    }).catch(() => {
        prompt("Copy the parameters JSON below:", json);
    });
}}, 'saveData').name('Save Parrameters');

otherFolder.add({loadData: () => {
    let input = prompt("Paste the saved parameters JSON here:");
    if (input) {
        try {
            
            let data = JSON.parse(input);
            console.log(data);
            // Manually update variables if needed
            if (data) {
                if (data.Canvas) {
                    if (data.Canvas.width !== undefined) dimensions.width = data.Canvas.width;
                    if (data.Canvas.height !== undefined) dimensions.height = data.Canvas.height;
                    if (data.Canvas['Canvas Size Multiplier'] !== undefined) canvasSizeMultiplier = data.Canvas['Canvas Size Multiplier'];
                    if (data.Canvas['Out of Bounds Borders']) {
                        Object.assign(oobBorders, data.Canvas['Out of Bounds Borders']);
                    }
                }
                if (data.Colors && Array.isArray(data.Colors.colors)) {
                    colors = data.Colors.colors.slice();
                    addColors();
                }
                if (data.Particles) {
                    if (data.Particles['Particle Text'] !== undefined) particleText = data.Particles['Particle Text'];
                    if (data.Particles['Particle Count'] !== undefined) particleCount = data.Particles['Particle Count'];
                    if (data.Particles['Default Particle Size'] !== undefined) defaultParticleSize = data.Particles['Default Particle Size'];
                    if (data.Particles['Repulsion Distance Multiplier'] !== undefined) repulsionDistMult = data.Particles['Repulsion Distance Multiplier'];
                    if (data.Particles['Particle Friction'] !== undefined) friction = data.Particles['Particle Friction'];
                    if (data.Particles['Particle Max Velocity'] !== undefined) maxVelocity = data.Particles['Particle Max Velocity'];
                }
            }
            // Update GUI controllers to reflect new values
            gui.updateDisplay();
            resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
            resizeCanvasToWindow();
            respawnParticles();
        } catch (e) {
            alert("Invalid JSON: " + e.message);
        }
    }
}}, 'loadData').name('Load Parameters')



function respawnParticles() {
    textParticles = [];
    setTextParticleCount(particleCount);
}