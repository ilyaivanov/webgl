#version 300 es

precision highp float;

out vec4 outColor;

in vec2 v_foo;

uniform float u_zoom;
uniform vec2 u_offset;

vec3 c1 = vec3(0.02f, 0.02f, 0.03f);
vec3 c2 = vec3(0.1f, 0.2f, 0.3f);
vec3 c3 = vec3(0.0f, 0.3f, 0.2f);
vec3 c4 = vec3(0.0f, 0.5f, 0.8f);

/* Linearly interpolate between the four given colors. */
vec3 palette(float t) {
  float x = 1.0f / 3.0f;
  if(t < x)
    return mix(c1, c2, t / x);
  else if(t < 2.0f * x)
    return mix(c2, c3, (t - x) / x);
  else if(t < 3.0f * x)
    return mix(c3, c4, (t - 2.0f * x) / x);
  return c4;
}

void main() {
  vec2 c = (v_foo * u_zoom) + u_offset;

  vec2 z = vec2(0.0f);

  int maxIterations = 400;
  float escapeRadius = 4.0f;

  int i;

  for(i = 0; i < maxIterations; i++) {
    z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0f * z.x * z.y + c.y);

    if(dot(z, z) > escapeRadius)
      break;
  }

  float color = float(i) / float(maxIterations);

  outColor = vec4(palette(color), 1.0f);
}