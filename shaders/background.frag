precision highp float;

uniform sampler2D tex0;
varying vec2 vTexCoord;

void main() {
    vec4 texture = texture2D(tex0, vTexCoord);
    if(texture.rgb == vec3(0.0)) {
        discard;
    }

    gl_FragColor = texture;
}
