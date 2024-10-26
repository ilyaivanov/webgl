import { createProgram, math } from "../common/index";
import vertexShader from "./foo.vert.glsl";
import fragmentShader from "./foo.frag.glsl";
import { m4 } from "../common/m4";

const canvas = document.createElement("canvas");
const canvas2d = document.createElement("canvas");
document.body.appendChild(canvas);
document.body.appendChild(canvas2d);

const ctx = canvas2d.getContext("2d")!;
const gl = canvas.getContext("webgl2")!;

window.addEventListener("resize", onResize);

const screen2 = { x: 0, y: 0 };
let scale = window.devicePixelRatio || 1;

function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.style.width = screen2.x + "px";
    canvas.style.height = screen2.y + "px";

    canvas.width = screen2.x * scale;
    canvas.height = screen2.y * scale;
}
function onResize() {
    scale = window.devicePixelRatio || 1;

    screen2.x = window.innerWidth;
    screen2.y = window.innerHeight;

    resizeCanvas(canvas);
    resizeCanvas(canvas2d);

    ctx.scale(scale, scale);
    gl.viewport(0, 0, screen2.x * scale, screen2.y * scale);
}
onResize();

const program = createProgram(gl, vertexShader, fragmentShader)!;

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// prettier-ignore
const cubePoints = [
    //front
    0,0,0,
    0,1,0,
    1,0,0,
    0,1,0,
    1,0,0,
    1,1,0,
];

function greyPlaneColors(v: number) {
    return Array.from(new Array(3 * 6)).map(() => v);
}

const aspect = screen2.x / screen2.y;
console.log(aspect);

// prettier-ignore
const foos = [
    0, 0,
    0, 1,
    aspect, 0,
    0, 1,
    aspect, 0,
    aspect, 1
];

// prettier-ignore
const colors = [
    // front
    ...greyPlaneColors(0xF2),
    
    // // //back
    // ...greyPlaneColors(0xF2),
    // // 0,    0,   0,
    // // 0,    0,   255,
    // // 0,    0,   255,
    // // 0,    0,   255,
    // // 0,    0,   255,
    // // 0,    0,   255,

    // // //bottom
    // ...greyPlaneColors(0xCC),
    // // 0,  255,   0,
    // // 0,  255,   0,
    // // 0,  255,   0,
    // // 0,  255,   0,
    // // 0,  255,   0,
    // // 0,  255,   0,

    // //top
    // ...greyPlaneColors(0xCC),


    // //left
    // ...greyPlaneColors(0x33),
    
    
    //right
    // ...greyPlaneColors(0x33),
    //  255,  40, 140, 
    //  255,  40, 140, 
    //  255,  40, 140, 
    //  255,  40, 140, 
    //  255,  40, 140, 
    //  255,  40, 140, 
];

if (colors.length / 3 != cubePoints.length / 3) {
    console.log(
        `Colors (${colors.length / 3}) is not enought for points (${cubePoints.length / 2})`
    );
}

const keys = new Set<string>();
document.addEventListener("keydown", (e) => keys.add(e.code));
document.addEventListener("keyup", (e) => keys.delete(e.code));

gl.enable(gl.DEPTH_TEST);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePoints), gl.STATIC_DRAW);

const va = gl.createVertexArray();
gl.bindVertexArray(va);

const positionsLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getAttribLocation(program, "a_foo");
gl.enableVertexAttribArray(positionsLocation);
gl.vertexAttribPointer(positionsLocation, 3, gl.FLOAT, false, 0, 0);

const colorsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(foos), gl.STATIC_DRAW);

gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 2, gl.FLOAT, true, 0, 0);

let fieldOfView = 75;
const matrix = gl.getUniformLocation(program, "u_matrix");
const zoomPos = gl.getUniformLocation(program, "u_zoom");
const offset = gl.getUniformLocation(program, "u_offset");

let zoom = 2;
let r = 0;
let cameraPos = { x: -2.5, y: -1, z: 3 };
function drawSquareAt(x: number, y: number, z: number, size: number) {
    // let m = getViewMatrix();

    // // m = m4.xRotate(m, degressToRads(-0));
    // m = m4.translate(m, x, y, z);
    // m = m4.scale(m, size, size, -size);
    // // m = m4.yRotate(m, degressToRads(-r));
    // m = m4.translate(m, -0.5, -0.5, -0.5);

    let m = m4.identity();
    gl.uniformMatrix4fv(matrix, false, m);
    gl.drawArrays(gl.TRIANGLES, 0, cubePoints.length / 3);
}
function drawFloor() {
    // let m = getViewMatrix();

    // m = m4.xRotate(m, degressToRads(-0));

    const size = 5;
    const height = 0.1;
    // // m = m4.translate(m, -size / 2, -height / 2, -size / 2);
    // // m = m4.yRotate(m, degressToRads(-r));
    // m = m4.translate(m, -size / 2, -size / 2, -0.5);
    // m = m4.scale(m, size, size, size);

    let m = m4.translation(-1, -1, 0);
    m = m4.scale(m, 2, 2, 1);

    gl.uniformMatrix4fv(matrix, false, m);
    gl.drawArrays(gl.TRIANGLES, 0, cubePoints.length / 3);
}

function getViewMatrix() {
    const aspect = screen2.x / screen2.y;
    let m = m4.perspective(math.degressToRads(fieldOfView), aspect, 0.2, 3000);

    let cameraMatrix = m4.xRotation(math.degressToRads(0));
    cameraMatrix = m4.translate(
        cameraMatrix,
        cameraPos.x,
        cameraPos.y,
        cameraPos.z
    );

    return m4.multiply(m, m4.inverse(cameraMatrix));
}
const zoomFactor = 2.5;
function updateZoom(deltaMs: number, zoomDirection: number) {
    // zoomDirection is +1 to zoom in, or -1 to zoom out
    const factor = Math.pow(zoomFactor, (zoomDirection * deltaMs) / 1000);
    const newZoom = zoom * factor;

    cameraPos.x += (aspect / 2) * zoom;
    cameraPos.y += 0.5 * zoom;

    zoom = newZoom;
    cameraPos.x -= (aspect / 2) * zoom;
    cameraPos.y -= 0.5 * zoom;

    // Clamp zoom if needed
    zoom = Math.max(zoom, 1e-10); // Prevent it from going too close to zero
}

function updateZoom2(deltaMs: number, zoomDirection: number) {
    const factor = Math.pow(zoomFactor, (zoomDirection * deltaMs) / 1000);
    let newZoom = zoom * factor;

    // Clamp zoom first
    newZoom = Math.max(newZoom, 1e-10); // Minimum threshold for zoom to avoid getting too close to zero

    // Calculate center position in world coordinates before applying the new zoom
    const centerX = cameraPos.x + 0.5 * (1 / zoom);
    const centerY = cameraPos.y + 0.5 * (1 / zoom);

    // Update zoom to the new value
    zoom = newZoom;

    // Adjust camera position to keep the center point fixed
    cameraPos.x = centerX - 0.5 * (1 / zoom);
    cameraPos.y = centerY - 0.5 * (1 / zoom);
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

    const zeroToOne = (Math.sin(time / 1000 - Math.PI / 2) + 1) / 2;
    r = zeroToOne * 360;

    ctx.clearRect(0, 0, screen2.x, screen2.y);
    ctx.font = "14px monospace";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    const l = `x: ${cameraPos.x.toFixed(2)} y: ${cameraPos.y.toFixed(2)} zoom: ${zoom}`;
    ctx.fillText(l, 20, 20);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // drawSquareAt(0, 0, -2.5, 1);
    gl.useProgram(program);

    gl.uniform1f(zoomPos, zoom);
    gl.uniform2f(offset, cameraPos.x, cameraPos.y);
    drawFloor();

    // const squares = 20;
    // const step = (Math.PI * 2) / squares;
    // for (let i = 0; i < squares; i++) {
    //     const angle = time / 1000 + step * i;
    //     const r = 1;
    //     const x = Math.sin(angle) * r;
    //     const y = Math.cos(angle) * r;

    //     drawSquareAt(x, 0.1, y, 0.1);
    // }

    // drawSquareAt(0.5, 0.5, 0, 0.2);
    // drawSquareAt(-0.5, 0.5, 0, 0.2);
    // drawSquareAt(0, 1, 0, 0.2);
    lastTime = time;
    requestAnimationFrame(onTick);
}
requestAnimationFrame(onTick);
