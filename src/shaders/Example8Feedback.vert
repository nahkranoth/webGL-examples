#version 300 es

 layout(location=0) in vec3 positions;
 layout(location=1) in vec3 colors;
 layout(location=2) in vec3 offset;

 out vec3 vPosition;
 out vec3 vColor;

 void main(){
     vPosition = positions;
     vColor = colors;
     gl_Position = vec4(vPosition, 1.0);
 }