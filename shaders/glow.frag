precision highp float;

uniform sampler2D tex0; // Last frame texture
uniform sampler2D buffer0; // Particle buffer texture

uniform float glow_size;
uniform vec3 glow_colour;
uniform float glow_intensity;
uniform float glow_threshold;
uniform vec2 canvasSize;

varying vec2 vTexCoord;

void main() {
    vec4 color = vec4(glow_colour, 0.0);
    //vec4 color = vec4(0.0);

    vec4 lastFrame = texture2D(tex0, vTexCoord);
    vec4 particleFrame = texture2D(buffer0, vTexCoord);


    float sum = 0.0;
    int count = 0;
    for(int dx = -4; dx <= 4; dx++) {
        for(int dy = -4; dy <= 4; dy++) {
            vec2 offset = vec2(float(dx), float(dy)) * glow_size / canvasSize;
            sum += texture2D(tex0, vTexCoord + offset).a;
            count++;
        }
    }
    sum /= float(count);

    

    color = vec4(color.xyz, sum * glow_intensity);
    
    if(particleFrame.a > 0.1) {
        color = vec4(glow_colour, 1.0);
    }

    if(color.a < 0.1) {
        discard;
    }
    
    gl_FragColor = color;
}