#version 300 es
precision highp float;

uniform vec3 uEye;
uniform float uTime;
in vec3 initialRay;

uniform sampler2D uTexture;
uniform float uTextureWeight;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec3 texColor = texture(uTexture, gl_FragCoord.xy / uRes).rgb;
    fragColor = vec4(texColor, 1.0);
}