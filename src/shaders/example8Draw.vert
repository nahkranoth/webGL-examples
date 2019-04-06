#version 300 es

layout(location=0) in vec3 positions;
layout(location=1) in vec3 colors;
layout(location=2) in vec3 offset;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
};

out vec3 vPosition;
out vec3 vColor;

 void main(){
    vec4 worldPosition = vec4(positions + offset, 0.0) * viewProj;

    vPosition = positions;
    vColor = colors;
    gl_Position = worldPosition;
 }