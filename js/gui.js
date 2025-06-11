let canvasSizeMultiplier = 1; // Multiplier for canvas size
let colorCount = 4; // Number of colors in the palette
let colors = ['#f29538', '#edd42d', '#fc7419', '#ffff8c'];
let defaultParticleSize = canvasSizeMultiplier * 130; // Default size for new particles
let friction = 0.2; // Friction applied to particles
let particleCount = 450; // Number of particles to generate
let particleText = "<3"; // Default text for particles
let maxVelocity = 50; // Maximum velocity for particles
let mouseCollision = true; // Toggle mouse collision for particles
let doRotation = false; // Toggle rotation for particles

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
canvasFolder.add(dimensions, 'width', 1, 5000, 1).name('Canvas Width').onFinishChange((value) => {
    setCanvasSize(value, dimensions.height);
}).listen();

canvasFolder.add(dimensions, 'height', 1, 5000, 1).name('Canvas Height').onFinishChange((value) => {
    setCanvasSize(dimensions.width, value);
}).listen();

canvasFolder.add({click: () => {
    setCanvasSize(3600, 3268);
    console.log('Canvas size reset to default:', dimensions.width, 'x', dimensions.height);
}}, 'click').name('Reset Canvas Size');

canvasFolder.add({canvasSizeMultiplier}, 'canvasSizeMultiplier', 0.1, 2, 0.1).name('Canvas Size Multiplier').onFinishChange((value) => {
    canvasSizeMultiplier = value;
    setCanvasSize(dimensions.width, dimensions.height);
    console.log('Canvas size multiplier changed to:', value);
}).listen();

function setCanvasSize(width, height) {
    dimensions.width = width;
    dimensions.height = height;
    resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
}


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
colorsFolder.add({colorCount}, 'colorCount', 1, 10, 1).name('Number of Color').onChange((value) => {
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
    colorsFolder.__controllers.filter(controller => controller.property !== 'colorCount').forEach(controller => {
        controller.remove();
    });

    const palette = { ...colors};
    for (let i = 0; i < colors.length; i++) {
        const colorKey = `color${i + 1}`;
        palette[colorKey] = colors[i];
        
        colorsFolder.addColor(palette, colorKey).name(`Color ${i + 1}`).onChange((value) => {
            colors[i] = value; // Update the colors array with the new value
            //console.log(`Color ${i + 1} changed to:`, value);
        });
    }
}


function setColors(palette) {
    colors = palette;
    colorsFolder.__controllers.forEach(controller => {
        if (controller.property.startsWith('color')) {
            const index = parseInt(controller.property.replace('color', '')) - 1;
            controller.setValue(colors[index]);
        }
    });
    colorsFolder.__controllers.find(controller => controller.property === 'colorCount').setValue(colors.length);
}
setColors(colors);


/* PARTICLES */
particleFolder.add({respawn: () => {
    textParticles = [];
    setTextParticleCount(particleCount);
}}, 'respawn').name('Respawn Particles');

particleFolder.add({particleText}, 'particleText').name('Particle Text').onChange((value) => {
    particleText = value;
    textParticles.forEach((particle) => {
        if (particle.tag !== "main") {
            particle.text = particleText; // Update text for all particles except the main one
        }
    });
}).listen();

particleFolder.add({particleCount}, 'particleCount', 0, 1000, 1).name('Particle Count').onChange((value) => {
    particleCount = value;
    respawnParticles()
}).listen();

particleFolder.add({defaultParticleSize}, 'defaultParticleSize', 0, 500, 1).name('Default Particle Size').onFinishChange((value) => {
    defaultParticleSize = value;
    respawnParticles()
}).listen();

particleFolder.add({repulsionDistMult}, 'repulsionDistMult', 0.1, 5, 0.1).name('Repulsion Distance Multiplier').onChange((value) => {
    repulsionDistMult = value;
}).listen();

particleFolder.add({friction}, 'friction', 0, 1, 0.01).name('Particle Friction').onChange((value) => {
    friction = value;
}).listen();

particleFolder.add({maxVelocity}, 'maxVelocity', 0, 50, 0.01).name('Particle Max Velocity').onChange((value) => {
    maxVelocity = value;
}).listen();

particleFolder.add({mouseCollision}, 'mouseCollision').name('Mouse Collision').onChange((value) => {
    mouseCollision = value;
}).listen();

particleFolder.add({doRotation}, 'doRotation').name('Do Rotation').onChange((value) => {
    doRotation = value;
}).listen();

/* OTHER */
otherFolder.add({debugMode}, 'debugMode').name('Debug Mode').onChange((value) => {
    debugMode = value;
}).listen();

// Save Parameters: Dynamically collect all GUI values
otherFolder.add({saveData: () => {
    function getControllerValue(controller) {
        // Handles .object and .property or .getValue()
        if (controller.getValue) return controller.getValue();
        if (controller.object && controller.property !== undefined) return controller.object[controller.property];
        return undefined;
    }
    function traverseFolder(folder) {
        let data = {};
        // Controllers
        folder.__controllers.forEach(ctrl => data[ctrl.property || ctrl.name] = getControllerValue(ctrl));
        // Subfolders
        if (folder.__folders) {
            Object.entries(folder.__folders).forEach(([name, subfolder]) => {
                data[name] = traverseFolder(subfolder);
            });
        }
        return data;
    }
    const data = traverseFolder(gui);
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert("Parameters copied to clipboard!");
    }).catch(() => {
        prompt("Copy the parameters JSON below:", json);
    });

    console.warn("Parameters saved:", json);
}}, 'saveData').name('Save Parameters');

// Load Parameters: Dynamically set all GUI values
otherFolder.add({loadData: () => {
    let input = prompt("Paste the saved parameters JSON here:");
    if (input) {
        try {
            const data = JSON.parse(input);

            function setControllerValue(controller, value) {
                // Try to use setValue if available, else set directly
                if (controller.setValue) controller.setValue(value);
                else if (controller.object && controller.property !== undefined) controller.object[controller.property] = value;
                if (controller.__onFinishChange) {
                    controller.__onFinishChange(value)
                }
            }
            function traverseAndSet(folder, values) {
                // Set controllers
                folder.__controllers.forEach(ctrl => {
                    if (ctrl.property in values) setControllerValue(ctrl, values[ctrl.property]);
                });
                // Set subfolders
                if (folder.__folders) {
                    Object.entries(folder.__folders).forEach(([name, subfolder]) => {
                        if (values[name]) traverseAndSet(subfolder, values[name]);
                    });
                }
            }
            traverseAndSet(gui, data);

            gui.updateDisplay();
            resetScene(data);
        } catch (e) {
            alert("Invalid JSON: " + e.message);
        }
    }
}}, 'loadData').name('Load Parameters');



function respawnParticles() {
    textParticles = [];
    setTextParticleCount(particleCount);
}

function resetScene(data) {
    // Reset scene using the current GUI settings
    //resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    //resizeCanvasToWindow();

    const dataColors = Array.from({ length: data.Colors.colorCount }, (_, i) => data.Colors[`color${i + 1}`] || '#000000');
    setColors(dataColors);

    textParticles = [];
    setTextParticleCount(particleCount);

}