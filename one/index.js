const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');

const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    canvas.width = entry.devicePixelContentBoxSize[0].inlineSize;
    canvas.height = entry.devicePixelContentBoxSize[0].blockSize;
    gl.viewport(0, 0, canvas.width, canvas.height);
});
resizeObserver.observe(canvas, {
    box: 'device-pixel-content-box',
});

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, await (await fetch('vertex.glsl')).text());
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vertexShader));
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, await (await fetch('fragment.glsl')).text());
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

const timeUniform = gl.getUniformLocation(program, 'u_time');

var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    // prettier-ignore
    new Uint32Array([
        0, 1, 2,
        0, 2, 3,
    ]),
    gl.STATIC_DRAW,
);

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
        -1, -1,
        -1,  1,
         1,  1,
         1, -1,
    ]),
    gl.STATIC_DRAW,
);

const positionAttribute = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttribute);
gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

gl.clearColor(0, 0, 0, 1);

const animate = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(timeUniform, performance.now());
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

    requestAnimationFrame(animate);
};
requestAnimationFrame(animate);

document.body.appendChild(canvas);
