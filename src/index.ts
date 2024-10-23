import { createProgram, degressToRads } from "./utils";
import vertexSource from "./triangle.vert.glsl";
import fragmentSource from "./triangle.frag.glsl";
import { m4 } from "./m4";
import { cubeColors, cubeMesh } from "./meshes/cube";

const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl2")!;

let scale = window.devicePixelRatio || 1;
const screen = { x: window.innerWidth, y: window.innerHeight };

function onResize() {
    screen.x = window.innerWidth;
    screen.y = window.innerHeight;
    scale = window.devicePixelRatio || 1;
    canvas.style.width = screen.x + "px";
    canvas.style.height = screen.y + "px";

    canvas.width = screen.x * scale;
    canvas.height = screen.y * scale;
}

onResize();

const program = createProgram(gl, vertexSource, fragmentSource)!;

const positionsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeMesh), gl.STATIC_DRAW);
const matrixUniform = gl.getUniformLocation(program, "u_matrix");

const vertexArray = gl.createVertexArray();
const positionAttr = gl.getAttribLocation(program, "a_position");
const colorAttr = gl.getAttribLocation(program, "a_color");

gl.bindVertexArray(vertexArray);
gl.enableVertexAttribArray(positionAttr);
gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

gl.enableVertexAttribArray(colorAttr);
gl.vertexAttribPointer(colorAttr, 3, gl.UNSIGNED_BYTE, true, 0, 0);

gl.enable(gl.DEPTH_TEST);

// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.FRONT_AND_BACK);

const keys = new Set<string>();
document.addEventListener("keydown", (e) => keys.add(e.code));
document.addEventListener("keyup", (e) => keys.delete(e.code));
let position = { x: 0, y: 0, z: 3 };
let rotation = { x: 0, y: 0, z: 0 };
let lastTime = 0;

let zPos = 0;
function onTick(time: number) {
    const delta = time - lastTime;

    const speed = 0.01;
    if (keys.has("KeyA")) position.x -= delta * speed;
    if (keys.has("KeyD")) position.x += delta * speed;
    if (keys.has("KeyS")) position.y += delta * speed;
    if (keys.has("KeyW")) position.y -= delta * speed;
    if (keys.has("ArrowUp")) position.z += delta * speed;
    if (keys.has("ArrowDown")) position.z -= delta * speed;

    const rotationSpeed = 0.001;
    if (keys.has("ArrowLeft")) rotation.y += delta * rotationSpeed;
    if (keys.has("ArrowRight")) rotation.y -= delta * rotationSpeed;

    gl.useProgram(program);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // var matrix = makeZToWMatrix(1);
    // const view = m4.projection(screen.x, screen.y, 400);
    let m = m4.perspective(degressToRads(50), screen.x / screen.y, 1, 2000);

    // let m = m4.multiply(matrix, view);
    m = m4.translate(m, position.x, position.y, -position.z);
    m = m4.scale(m, 1, 1, -1);
    m = m4.yRotate(m, rotation.y);
    m = m4.translate(m, -0.5, -0.5, -0.5);

    gl.uniformMatrix4fv(matrixUniform, false, m);
    gl.viewport(0, 0, screen.x * scale, screen.y * scale);
    gl.bindVertexArray(vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, cubeColors.length / 3);

    lastTime = time;
    requestAnimationFrame(onTick);
}

requestAnimationFrame(onTick);

document.body.appendChild(canvas);
