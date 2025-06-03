precision highp float;

uniform sampler2D tex0;

uniform float glow_size;
uniform vec3 glow_colour;
uniform float glow_intensity;
uniform float glow_threshold;
uniform vec2 canvasSize;

varying vec2 vTexCoord;

void main() {
    vec4 pixel = texture2D(tex0, vTexCoord);
    if(pixel.rgb == vec3(0.0)) {
        pixel.a = 1.; // Ensure fully transparent pixels are black
    }

    if (pixel.a <= glow_threshold) {
        vec2 size = canvasSize;
        vec2 uv = vTexCoord;

        float sum = 0.0;
        for (int y = -4; y <= 4; ++y) {
            for (int x = -4; x <= 4; ++x) {
                vec2 offset = vec2(float(x), float(y)) * glow_size;
                sum += texture2D(tex0, vTexCoord + offset).a;
            }
        }
        sum /= 81.0;


        pixel = vec4(glow_colour, (sum / 9.0) * glow_intensity);
        //pixel = vec4(vTexCoord, 0., 1.);
    }

    gl_FragColor = pixel;
    //gl_FragColor = vec4(vTexCoord, 0.0, 1.0); // Debug: output texture coordinates
}
