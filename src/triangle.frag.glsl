#version 300 es

precision highp float;

out vec4 outColor;

in vec4 v_color;

void main() {
  // outColor = vec4(1, 1, 1, 1);
  outColor = v_color;
}