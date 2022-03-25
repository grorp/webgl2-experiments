import {
    vec2,
    vec3,
    mat4,
} from 'https://cdn.skypack.dev/pin/gl-matrix@v3.4.3-OSmwlRYK5GW1unkuAQkN/mode=imports,min/optimized/gl-matrix.js';

/*
    Setup
*/

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

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

/*
    Shaders
*/

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

/*
    Controls
*/

const controls = {
    position: vec3.fromValues(0, 2, 3.5),
    rotation: vec2.fromValues(-Math.PI / 8, 0),

    movement: {
        forward: false,
        backward: false,
        left: false,
        right: false,

        down: false,
        up: false,

        fast: false,
    },
};

const controlsActive = () => document.pointerLockElement === document.body;

document.addEventListener('click', () => {
    if (!controlsActive()) {
        document.body.requestPointerLock();
    }
});

document.addEventListener('mousemove', (event) => {
    if (controlsActive()) {
        controls.rotation[1] += -event.movementX * 0.0025;

        controls.rotation[0] += -event.movementY * 0.0025;
        if (controls.rotation[0] < -Math.PI / 2) {
            controls.rotation[0] = -Math.PI / 2;
        }
        if (controls.rotation[0] > Math.PI / 2) {
            controls.rotation[0] = Math.PI / 2;
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (controlsActive()) {
        const pressedKey = event.key.toLowerCase();

        switch (pressedKey) {
            case 'w':
                controls.movement.forward = true;
                break;
            case 's':
                controls.movement.backward = true;
                break;
            case 'a':
                controls.movement.left = true;
                break;
            case 'd':
                controls.movement.right = true;
                break;

            case 'shift':
                controls.movement.down = true;
                break;
            case ' ':
                controls.movement.up = true;
                break;

            case 'e':
                controls.movement.fast = true;
                break;
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (controlsActive()) {
        const releasedKey = event.key.toLowerCase();

        switch (releasedKey) {
            case 'w':
                controls.movement.forward = false;
                break;
            case 's':
                controls.movement.backward = false;
                break;
            case 'a':
                controls.movement.left = false;
                break;
            case 'd':
                controls.movement.right = false;
                break;

            case 'shift':
                controls.movement.down = false;
                break;
            case ' ':
                controls.movement.up = false;
                break;

            case 'e':
                controls.movement.fast = false;
                break;
        }
    }
});

const positionDelta = vec3.create();
const origin = vec3.create();

const move = (timeDelta) => {
    if (controls.movement.forward) {
        positionDelta[2] -= 1;
    }
    if (controls.movement.backward) {
        positionDelta[2] += 1;
    }
    if (controls.movement.left) {
        positionDelta[0] -= 1;
    }
    if (controls.movement.right) {
        positionDelta[0] += 1;
    }
    vec3.rotateY(positionDelta, positionDelta, origin, controls.rotation[1]);

    if (controls.movement.down) {
        positionDelta[1] -= 1;
    }
    if (controls.movement.up) {
        positionDelta[1] += 1;
    }

    vec3.normalize(positionDelta, positionDelta);
    vec3.scale(
        positionDelta,
        positionDelta,
        timeDelta * (controls.movement.fast ? 0.01 : 0.0015),
    );

    vec3.add(controls.position, controls.position, positionDelta);
    vec3.zero(positionDelta);
};

/*
    Camera
*/

const matrixUniform = gl.getUniformLocation(program, 'u_matrix');

const matrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

const updateMatrixUniform = () => {
    mat4.identity(viewMatrix);
    mat4.translate(viewMatrix, viewMatrix, controls.position);
    mat4.rotateY(viewMatrix, viewMatrix, controls.rotation[1]);
    mat4.rotateX(viewMatrix, viewMatrix, controls.rotation[0]);
    mat4.invert(viewMatrix, viewMatrix);

    mat4.perspective(
        projectionMatrix,
        (Math.PI / 5) * 2,
        canvas.width / canvas.height,
        0.1,
        Infinity,
    );

    mat4.multiply(matrix, projectionMatrix, viewMatrix);

    gl.uniformMatrix4fv(matrixUniform, false, matrix);
};

/*
    Geometry
*/

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// prettier-ignore
const indices = new Uint8Array([
    0, 1, 2,
    0, 2, 3,

    4, 5, 6,
    4, 6, 7,

    8, 9, 10,
]);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// prettier-ignore
const vertices = new Float32Array([
    1.5, 0, 1.5,
    0.86, 0.08, 0.24,

    1.5, 0, -1.5,
    0.86, 0.08, 0.24,

    -1.5, 0, -1.5,
    0.86, 0.08, 0.24,

    -1.5, 0, 1.5,
    0.86, 0.08, 0.24,


    0.5, 0, -0.5,
    0.1, 0.1, 0.44,

    0.5, 1, -0.5,
    0.54, 0.17, 0.89,

    -0.5, 1, -0.5,
    0.54, 0.17, 0.89,

    -0.5, 0, -0.5,
    0.1, 0.1, 0.44,


    0.5, 0, 0.5,
    0, 1, 0,

    0, 1, 0.5,
    1, 1, 0,

    -0.5, 0, 0.5,
    0, 1, 0,
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionAttribute = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttribute);
gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 24, 0);

const colorAttribute = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(colorAttribute);
gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 24, 12);

/*
    Last WebGL preparations...
*/

gl.clearColor(0.5, 1, 0.83, 1);
// gl.enable(gl.CULL_FACE);
// works, but looks bad.
gl.enable(gl.DEPTH_TEST);

/*
    ...and go!
*/

let timeLast;

const animate = () => {
    const timeNow = performance.now();
    const timeDelta = timeNow - (timeLast ?? timeNow);

    move(timeDelta);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    updateMatrixUniform();
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);

    timeLast = timeNow;
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
