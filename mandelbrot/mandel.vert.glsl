#version 300 es

in vec4 a_position;
in vec2 a_foo;

uniform mat4 u_matrix;

out vec2 v_foo;

void main() {
    gl_Position = u_matrix * a_position;
    // gl_Position = vec4(a_position.x, a_position.yzw);
    v_foo = a_foo;
}
