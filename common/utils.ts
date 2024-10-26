export function createShader(
    gl: WebGL2RenderingContext,
    type:
        | WebGLRenderingContext["FRAGMENT_SHADER"]
        | WebGLRenderingContext["VERTEX_SHADER"],
    source: string
) {
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

export function createProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
) {
    var program = gl.createProgram()!;
    gl.attachShader(
        program,
        createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!
    );
    gl.attachShader(
        program,
        createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!
    );
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
