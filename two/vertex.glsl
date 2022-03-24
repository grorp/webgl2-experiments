#version 300 es

uniform mat4 u_matrix;
in vec3 a_position;
in vec3 a_color;

out vec3 v_position;
out vec3 v_color;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);

    v_position = a_position;
    v_color = a_color;
}
