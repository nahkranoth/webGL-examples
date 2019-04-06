#version 300 es

layout(location=0) in vec3 positions;

out vec3 vPosition;

void main() {
    vPosition = positions;// + vec3(0.01, 0, 0)
	gl_Position = vec4(vec3(0.0), 1.0);
}
