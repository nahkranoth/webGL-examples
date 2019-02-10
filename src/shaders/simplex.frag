#version 300 es
precision highp float;
layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
};

uniform sampler2D tex;
uniform float uTime;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;
out vec4 fragColor;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    vec2 mUV = vec2( vUV.x, vUV.y);
    vec4 texture = texture(tex, mUV);
    vec2 pos = vec2(mUV*10.0);
    float n = round(noise(pos + (uTime * 3.0)));
    if(n == 0.0) discard;
    vec3 color = vec3(n);
    vec3 normal = normalize(vNormal);
    fragColor = texture * vec4(color , 1.0 );
}