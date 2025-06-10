let canvasSizeMultiplier = 1; // Multiplier for canvas size
//let colors = ['#03fcd3', '#f279e4', '#f2ea79', '#ac79f2', '#ff5996'];
let colors = ['#f29538', '#edd42d', '#fc7419', '#ffff8c'];
const defaultParticleSize = canvasSizeMultiplier * 130; // Default size for new particles

let oobBorders = {
    top: 0,
    bottom: defaultParticleSize / 2,
    left: 200,
    right: -200,
}

let dimensions = {
    width: 3600,
    height: 3268
};

let repulsionDistMult = 1.3;
let debugMode = false; // Debug mode flag.





let gui = new dat.GUI({
    name: 'Controls',
    hidable: true,
    width: 300
});

let canvasFolder = gui.addFolder('Canvas');
let colorsFolder = gui.addFolder('Colors');
let particleFolder = gui.addFolder('Particles');
colorsFolder.open();

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
canvasFolder.open();


let oobBordersFolder = canvasFolder.addFolder('Out of Bounds Borders');
oobBordersFolder.add(oobBorders, 'top', -dimensions.height, dimensions.height).name('Top Border').onFinishChange((value) => {
    oobBorders.top = value;
}).listen();
oobBordersFolder.add(oobBorders, 'bottom', -dimensions.height, dimensions.height).name('Bottom Border').onFinishChange((value) => {
    oobBorders.bottom = value;
}).listen();
oobBordersFolder.add(oobBorders, 'left', -dimensions.width, dimensions.width).name('Left Border').onFinishChange((value) => {
    oobBorders.left = value;
}).listen();
oobBordersFolder.add(oobBorders, 'right', -dimensions.width, dimensions.width).name('Right Border').onFinishChange((value) => {
    oobBorders.right = value;
}).listen();


canvasFolder.add({click: () => {
    dimensions.width = 3600;
    dimensions.height = 3268;
    resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
    console.log('Canvas size reset to default:', dimensions.width, 'x', dimensions.height);
}}, 'click').name('Reset Canvas Size');


let canvasSizeMultiplierFolder = canvasFolder.add({value: canvasSizeMultiplier}, 'value', 0.1, 2, 0.1).name('Canvas Size Multiplier').onFinishChange((value) => {
    // Update the canvas size multiplier and resize the canvas
    canvasSizeMultiplier = value;
    console.log('Canvas size multiplier changed to:', value);
    resizeCanvas(dimensions.width * canvasSizeMultiplier, dimensions.height * canvasSizeMultiplier);
    resizeCanvasToWindow();
}).listen();


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


/* gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '10px';
gui.domElement.style.right = '10px'; */