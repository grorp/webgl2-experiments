#version 300 es
precision highp float;

uniform float u_time;
in vec2 v_position;
out vec4 out_color;

void main() {
    out_color = vec4(
        v_position.x * 0.5 + 0.5,
        -v_position.x * 0.5 + 0.5,
        v_position.y * sin(u_time / 100.0) * 0.5 + 0.5,
        1.0
    );
}
