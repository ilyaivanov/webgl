import { createProgram, degressToRads } from "./utils";
import vertexSource from "./triangle.vert.glsl";
import fragmentSource from "./triangle.frag.glsl";
import { m4 } from "./m4";

const canvas = document.createElement("canvas");
const canvas2d = document.createElement("canvas");
const ctx = canvas2d.getContext("2d")!;
const gl = canvas.getContext("webgl2")!;

let scale = window.devicePixelRatio || 1;
const screen = { x: window.innerWidth, y: window.innerHeight };

function onResize() {
    screen.x = window.innerWidth;
    screen.y = window.innerHeight;
    scale = window.devicePixelRatio || 1;
    function setCanvas(canvas: HTMLCanvasElement) {
        canvas.style.width = screen.x + "px";
        canvas.style.height = screen.y + "px";

        canvas.width = screen.x * scale;
        canvas.height = screen.y * scale;
    }
    setCanvas(canvas);
    setCanvas(canvas2d);

    ctx.scale(scale, scale);
}

onResize();

const program = createProgram(gl, vertexSource, fragmentSource)!;

const positionsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1]),
    gl.STATIC_DRAW
);
const matrixUniform = gl.getUniformLocation(program, "u_matrix");

const vertexArray = gl.createVertexArray();
const positionAttr = gl.getAttribLocation(program, "a_position");

gl.bindVertexArray(vertexArray);
gl.enableVertexAttribArray(positionAttr);
gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

gl.enable(gl.DEPTH_TEST);

const keys = new Set<string>();
document.addEventListener("keydown", (e) => keys.add(e.code));
document.addEventListener("keyup", (e) => keys.delete(e.code));
let lastTime = 0;

function onTick(time: number) {
    const delta = time - lastTime;

    ctx.font = "14px monospace";
    ctx.fillStyle = "white";

    ctx.clearRect(0, 0, screen.x, screen.y);
    ctx.textBaseline = "top";
    ctx.fillText("Speed: " + zSpeed.toFixed(3), 20, 20);

    if (keys.has("KeyW")) zSpeed += (0.1 * delta) / 1000;
    if (keys.has("KeyS")) zSpeed -= (0.1 * delta) / 1000;

    zPos += delta * zSpeed;
    if (zPos > zMax) zPos = zMin;

    gl.useProgram(program);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // var matrix = makeZToWMatrix(1);
    // const view = m4.projection(screen.x, screen.y, 400);

    // const base = m4.translate(m, position.x, position.y, -position.z);

    gl.viewport(0, 0, screen.x * scale, screen.y * scale);
    gl.bindVertexArray(vertexArray);

    drawLineAt(-0.3);
    drawLineAt(0.3);

    drawShortLines();
    lastTime = time;
    requestAnimationFrame(onTick);
}

function drawLineAt(x: number) {
    let m = m4.perspective(degressToRads(50), screen.x / screen.y, 0.1, 2000);

    const width = 0.03;
    let local = m4.translate(m, x - width / 2, -0.3, -100);
    local = m4.scale(local, width, 1, 140);

    gl.uniformMatrix4fv(matrixUniform, false, local);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let zMin = -20;
let zMax = -10;
let zSpeed = 0.01;
let zPos = zMin;
function drawShortLines() {
    const lines = 4;
    for (let i = 0; i < lines; i++) {
        let m = m4.perspective(
            degressToRads(50),
            screen.x / screen.y,
            0.1,
            2000
        );

        const width = 0.01;
        let local = m4.translate(m, 0 - width / 2, -0.3, zPos + i * 10);
        local = m4.scale(local, width, 1, 0.5);

        gl.uniformMatrix4fv(matrixUniform, false, local);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

requestAnimationFrame(onTick);

document.body.appendChild(canvas);
document.body.appendChild(canvas2d);
