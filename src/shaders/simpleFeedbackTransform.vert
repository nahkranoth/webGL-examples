#version 300 es

#define SIN2 0.03489949
#define COS2 0.99939082

layout(location=0) in vec2 position;
layout(location=1) in vec3 color;

out vec2 vPosition;
out vec3 vColor;

void main(){
    mat2 rotation = mat2(
        COS2, SIN2,
        -SIN2, COS2
    );

    vPosition = rotation * position;
    vColor = color;
    gl_Position = vec4(vPosition, 0.0, 1.0);
}