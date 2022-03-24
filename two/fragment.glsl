#version 300 es
precision highp float;

in vec3 v_position;
in vec3 v_color;

out vec4 out_color;

void main() {
    out_color = vec4(v_color, 1.0);
}
