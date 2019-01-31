#version 300 es
precision highp float;
layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
    vec4 lightPosition;
};

uniform float uTime;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;
out vec4 fragColor;

void main() {
    vec2 mUV = vec2( vUV.x, vUV.y);

    vec3 color = vec3(mUV.x, mUV.y, 0.0);
    vec3 normal = normalize(vNormal);
    vec3 eyeVec = normalize(eyePosition.xyz - vPosition);
    vec3 incidentVec = normalize(vPosition - lightPosition.xyz);
    vec3 lightVec = -incidentVec;
    float diffuse = max(dot(lightVec, normal), 0.0);
    float highlight = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    float ambient = 0.3;
    fragColor = vec4(color * (diffuse + highlight + ambient), 1.0) * ( 1.0 - (sin(uTime) + 0.5) - 0.5 );
}