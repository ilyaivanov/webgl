import { createProgram, m4 } from "../common/index";
import vertexShader from "./mandel.vert.glsl";
import fragmentShader from "./mandel.frag.glsl";

const canvas = document.createElement("canvas");
const canvas2d = document.createElement("canvas");
document.body.appendChild(canvas);
document.body.appendChild(canvas2d);

const ctx = canvas2d.getContext("2d")!;
const gl = canvas.getContext("webgl2")!;

window.addEventListener("resize", onResize);

const screen = { x: 0, y: 0 };
let scale = window.devicePixelRatio || 1;

let zoom = 2;
let cameraPos = { x: -1.5, y: -1, z: 3 };
const zoomFactor = 2.5;

function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.style.width = screen.x + "px";
    canvas.style.height = screen.y + "px";

    canvas.width = screen.x * scale;
    canvas.height = screen.y * scale;
}
function onResize() {
    scale = window.devicePixelRatio || 1;

    screen.x = window.innerWidth;
    screen.y = window.innerHeight;

    resizeCanvas(canvas);
    resizeCanvas(canvas2d);

    ctx.scale(scale, scale);
    gl.viewport(0, 0, screen.x * scale, screen.y * scale);
}
onResize();

const program = createProgram(gl, vertexShader, fragmentShader)!;

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// prettier-ignore
const planePoints = [
    0,0,0,
    0,1,0,
    1,0,0,
    0,1,0,
    1,0,0,
    1,1,0,
];

const aspect = screen.x / screen.y;

// prettier-ignore
const ndcPoints = [
    0, 0,
    0, 1,
    aspect, 0,
    0, 1,
    aspect, 0,
    aspect, 1
];

const keys = new Set<string>();
document.addEventListener("keydown", (e) => keys.add(e.code));
document.addEventListener("keyup", (e) => keys.delete(e.code));

gl.enable(gl.DEPTH_TEST);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planePoints), gl.STATIC_DRAW);

const va = gl.createVertexArray();
gl.bindVertexArray(va);

const positionsLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getAttribLocation(program, "a_foo");
gl.enableVertexAttribArray(positionsLocation);
gl.vertexAttribPointer(positionsLocation, 3, gl.FLOAT, false, 0, 0);

const ndcPointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, ndcPointsBuffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ndcPoints), gl.STATIC_DRAW);

gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 2, gl.FLOAT, true, 0, 0);

const matrix = gl.getUniformLocation(program, "u_matrix");
const zoomPos = gl.getUniformLocation(program, "u_zoom");
const offset = gl.getUniformLocation(program, "u_offset");

function updateZoom(deltaMs: number, zoomDirection: number) {
    const factor = Math.pow(zoomFactor, (zoomDirection * deltaMs) / 1000);
    const newZoom = zoom * factor;

    cameraPos.x += (aspect / 2) * zoom;
    cameraPos.y += 0.5 * zoom;

    zoom = newZoom;
    cameraPos.x -= (aspect / 2) * zoom;
    cameraPos.y -= 0.5 * zoom;

    zoom = Math.max(zoom, 1e-10);
}

let lastTime = 0;
function onTick(time: number) {
    const deltaMs = time - lastTime;
    const speed = 0.5;
    if (keys.has("KeyW")) cameraPos.y += (speed * zoom * deltaMs) / 1000;
    if (keys.has("KeyS")) cameraPos.y -= (speed * zoom * deltaMs) / 1000;
    if (keys.has("KeyA")) cameraPos.x -= (speed * zoom * deltaMs) / 1000;
    if (keys.has("KeyD")) cameraPos.x += (speed * zoom * deltaMs) / 1000;

    if (keys.has("ArrowUp")) updateZoom(deltaMs, -1);
    if (keys.has("ArrowDown")) updateZoom(deltaMs, 1);

    ctx.clearRect(0, 0, screen.x, screen.y);
    ctx.font = "14px monospace";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    const l = `x: ${cameraPos.x.toFixed(8)} y: ${cameraPos.y.toFixed(8)} zoom: ${zoom.toFixed(8)}`;
    ctx.fillText(l, 20, 20);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform1f(zoomPos, zoom);
    gl.uniform2f(offset, cameraPos.x, cameraPos.y);

    let m = m4.translation(-1, -1, 0);
    m = m4.scale(m, 2, 2, 1);

    gl.uniformMatrix4fv(matrix, false, m);
    gl.drawArrays(gl.TRIANGLES, 0, planePoints.length / 3);

    lastTime = time;
    requestAnimationFrame(onTick);
}
requestAnimationFrame(onTick);
