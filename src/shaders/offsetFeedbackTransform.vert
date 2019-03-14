#version 300 es

layout(location=0) in vec3 position;
layout(location=1) in vec3 color;
layout(location=2) in vec3 offsets;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
};

out vec3 vColor;

void main(){
    vec4 worldPosition = vec4(position + offsets, 0.0) * viewProj;
    vColor = color;
    gl_Position = worldPosition;
}