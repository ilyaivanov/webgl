import fragmentShaderSource from "./shaders/fragment.frag";
import vertexShaderSource from "./shaders/vertex.vert";

const canvas = document.createElement("canvas")!;
const gl = canvas.getContext("webgl2")!;

canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

const scale = window.devicePixelRatio;
canvas.width = window.innerWidth * scale;
canvas.height = window.innerHeight * scale;

function createShader(type: number, source: string) {
    var shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(vertexShader: any, fragmentShader: any) {
    var program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

const program = createProgram(vertexShader, fragmentShader)!;

if (program) console.log("All is good");

var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// var positions = [0, 0, 0, 0.5, 0.7, 0];
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

let c = 0;
function onTick(time: number) {
    gl.clearColor(0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    var positions = [0, 0, 0, 0.5, c, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    c = (Math.sin(time / 1000) + 1) / 2;
    requestAnimationFrame(onTick);
}

requestAnimationFrame(onTick);
document.body.appendChild(canvas);
