console.log("Калібрування катадіоптричної камери")

let gl, shProg;
let video;
let videoTexture, videoSurface, ringSurface;

function init() {
    canvas = document.querySelector("canvas");
    gl = canvas.getContext("webgl");
    canvas.width = 512;
    canvas.height = 512;
    gl.viewport(0, 0, 512, 512);

    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    shProg = new ShaderProgram(prog)
    shProg.use()
    shProg.iAttribVertex = gl.getAttribLocation(shProg.prog, "vertex")
    shProg.iAttribTexCoord = gl.getAttribLocation(shProg.prog, "texCoord")
    shProg.iTMU = gl.getUniformLocation(shProg.prog, "tmu")
    shProg.iColor = gl.getUniformLocation(shProg.prog, "color")

    gl.uniform1i(shProg.iTMU, 0);
    gl.uniform4fv(shProg.iColor, [1, 1, 1, 1]);

    videoTexture = createTexture();
    videoSurface = new Model();

    //AFTER

    let num = 121;
    videoSurface.vertexBufferData(gridVertices2(num, num))
    videoSurface.textureBufferData(sphereTexCoords(num, num))

    //-------------------------------------------------------

    //BEFORE

    // let num = 1000
    // videoSurface.vertexBufferData(planeVertices(num))
    // videoSurface.textureBufferData(ringTexCoords(num))

    //-------------------------------------------------------

    //trials

    // videoSurface.vertexBufferData(rectVertices())
    // videoSurface.vertexBufferData(gridVertices(20, 20))
    // videoSurface.vertexBufferData(sphereVertices(num, num))

    // videoSurface.textureBufferData(rectTexCoords())
    // videoSurface.textureBufferData(planeTexCoords(num))
    // videoSurface.textureBufferData(gridTexCoords(20, 20))

    // ringSurface = new Model();

    // ringSurface.vertexBufferData(ringVertices(num))
    // ringSurface.vertexBufferData(ringGridVertices(100, 20))
    // ringSurface.textureBufferData(ringTexCoords(num))
    // ringSurface.textureBufferData(ringGridTexCoords(100, 20))

    drawLoop();
}

function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, videoTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    videoSurface.draw();
    // videoSurface.drawStroke(); // outline geometry


    // ringSurface.draw();
    // ringSurface.drawStroke();
}

function drawLoop() {
    draw()
    window.requestAnimationFrame(drawLoop)
}

const PI = 3.141592,
    MINR = 0.001,
    MAXR = 1.0

function sphereTexCoords(numX, numY, r = 1) {
    let ratio = 480 / 640
    let offsetX = (640 - 480) / 640 * 0.5
    const limitX = Math.PI * 0.5
    const limitY = Math.PI * 2.0
    const stepX = limitX / numX;
    const stepY = limitY / numY;
    let theta = 0;
    let phi = 0;
    let vertices = []
    while (theta < limitX) {
        phi = 0;
        while (phi < limitY) {
            let x = r * Math.sin(theta) * Math.cos(phi)
            let y = r * Math.sin(theta) * Math.sin(phi)
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            phi += stepY
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            phi -= stepY
            theta += stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            phi += stepY
            theta -= stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            theta += stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            vertices.push(1 - ((x + 1) * 0.5 * ratio + offsetX), 1 - (y + 1) * 0.5);
            theta -= stepX;
        }
        theta += stepX;
    }
    return vertices;
}

function gridVertices2(numX, numY, trY = 0) {
    let ratio = 480.0 / 640.0
    let mult = 2,
        multX = mult,
        multY = mult * ratio
    let translateX = -0.5 * multX
    let translateY = (-0.5 + trY) * multY
    const limitX = 1.0
    const limitY = 1.0 * ratio
    const stepX = limitX / numX;
    const stepY = limitY / numY;
    let vertices = []
    let x = 0
    let y = 0
    while (y < limitY) {
        x = 0;
        while (x < limitX) {
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            x += stepX
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            x -= stepX
            y += stepY
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            x += stepX
            y -= stepY
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            y += stepY
            vertices.push(x * multX + translateX, y * multY + translateY, 0);
            y -= stepY
        }
        y += stepY
    }
    return vertices;
}

function getWebCam() {
    video = document.querySelector("video");
    video.setAttribute('autoplay', true);
    navigator.getUserMedia({ video: { width: 640, height: 480 }, audio: false }, stream => {
        video.srcObject = stream;
        console.log("Доступ до камери дозволено")
        init();
    }, e => {
        console.error('Rejected!', e);
    });
}

function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vsh, vShader)
    gl.compileShader(vsh)
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error(`Error in vertex shader: ${gl.getShaderInfoLog(vsh)}`)
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fsh, fShader)
    gl.compileShader(fsh)
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error(`Error in fragment shader: ${gl.getShaderInfoLog(fsh)}`)
    }
    let prog = gl.createProgram()
    gl.attachShader(prog, vsh)
    gl.attachShader(prog, fsh)
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(`Error linking a program: ${gl.getProgramLogInfo(prog)}`)
    }
    return prog;
}

function createTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

// next starts experiments

function rectVertices() {
    let mult = 1.4,
        multX = mult * 640 / 480,
        multY = mult
    let translateX = -0.5 * multX
    let translateY = -0.5 * multY
    let verts = [
        [0 + translateX, 0 + translateY, 0],
        [0 + translateX, 1 * multY + translateY, 0],
        [1 * multX + translateX, 1 * multY + translateY, 0],
        [1 * multX + translateX, 0 + translateY, 0]
    ]
    let inds = [0, 1, 2, 2, 3, 0]
    let vertices = []
    for (let i = 0; i < inds.length; i++) {
        vertices.push(...verts[inds[i]])
    }
    return vertices;
}

function rectTexCoords() {
    let texs = [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
    ]
    let inds = [2, 3, 0, 0, 1, 2]
    let texCoords = []
    for (let i = 0; i < inds.length; i++) {
        texCoords.push(...texs[inds[i]])
    }
    console.log(texCoords);
    return texCoords;
}

function planeVertices(num, height = 1, trY = 0) {
    let mult = 1.4,
        multX = mult * 640 / 480,
        multY = mult
    let translateX = -0.5 * multX
    let translateY = (-0.5 + trY) * multY
    if (num < 2) {
        num = 2;
    }
    let vertices = []
    let step = num / (num - 1)
    let normalStep = step / num;
    vertices.push(0 + translateX, 0 + translateY, 0)
    vertices.push(0 + translateX, height * multY + translateY, 0)
    vertices.push(normalStep * multX + translateX, height * multY + translateY, 0)
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            vertices.push(normalStep * i * multX + translateX, 0 + translateY, 0)
            vertices.push(normalStep * (i - 1) * multX + translateX, height * multY + translateY, 0)
            vertices.push(normalStep * (i + 1) * multX + translateX, height * multY + translateY, 0)
        } else {
            vertices.push(normalStep * i * multX + translateX, height * multY + translateY, 0)
            vertices.push(normalStep * (i - 1) * multX + translateX, 0 + translateY, 0)
            vertices.push(normalStep * (i + 1) * multX + translateX, 0 + translateY, 0)
        }
    }
    if (num % 2 == 0) {
        vertices.push(1 * multX + translateX, height * multY + translateY, 0)
        vertices.push((1.0 - normalStep) * multX + translateX, 0 * multY + translateY, 0)
        vertices.push(1 * multX + translateX, 0 * multY + translateY, 0)
    } else {
        vertices.push(1 * multX + translateX, 0 + translateY, 0)
        vertices.push((1.0 - normalStep) * multX + translateX, height * multY + translateY, 0)
        vertices.push(1 * multX + translateX, height * multY + translateY, 0)
    }
    return vertices;
}
function planeTexCoords(num, height = 1, trY = 0) {

    if (num < 2) {
        num = 2;
    }
    let texCoords = []
    let step = num / (num - 1)
    let normalStep = step / num;
    texCoords.push(1, height + trY)
    texCoords.push(1, trY)
    texCoords.push(1.0 - normalStep, trY)
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            texCoords.push(1.0 - normalStep * i, height + trY)
            texCoords.push(1.0 - normalStep * (i - 1), trY)
            texCoords.push(1.0 - normalStep * (i + 1), trY)
        } else {
            texCoords.push(1.0 - normalStep * i, trY)
            texCoords.push(1.0 - normalStep * (i - 1), height + trY)
            texCoords.push(1.0 - normalStep * (i + 1), height + trY)
        }
    }
    if (num % 2 == 0) {
        texCoords.push(0, trY)
        texCoords.push(normalStep, height + trY)
        texCoords.push(0, height + trY)
    } else {
        texCoords.push(0, height + trY)
        texCoords.push(normalStep, trY)
        texCoords.push(0, trY)
    }
    return texCoords;
}

function ringVertices(num) {
    let vertices = []
    let angleStep = num / ((num - 1) * num) * 2 * PI;
    vertices.push(MAXR * Math.cos(0.0), MAXR * Math.sin(0.0), 0);
    vertices.push(MINR * Math.cos(0.0), MINR * Math.sin(0.0), 0);
    vertices.push(MINR * Math.cos(angleStep), MINR * Math.sin(angleStep), 0);
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            vertices.push(MAXR * Math.cos(angleStep * i), MAXR * Math.sin(angleStep * i), 0)
            vertices.push(MINR * Math.cos(angleStep * (i - 1)), MINR * Math.sin(angleStep * (i - 1)), 0)
            vertices.push(MINR * Math.cos(angleStep * (i + 1)), MINR * Math.sin(angleStep * (i + 1)), 0)
        } else {
            vertices.push(MINR * Math.cos(angleStep * i), MINR * Math.sin(angleStep * i), 0)
            vertices.push(MAXR * Math.cos(angleStep * (i - 1)), MAXR * Math.sin(angleStep * (i - 1)), 0)
            vertices.push(MAXR * Math.cos(angleStep * (i + 1)), MAXR * Math.sin(angleStep * (i + 1)), 0)
        }
    }
    if (num % 2 == 0) {
        vertices.push(MINR * Math.cos(0.0), MAXR * Math.sin(0.0), 0);
        vertices.push(MAXR * Math.cos(0.0), MAXR * Math.sin(0.0), 0);
        vertices.push(MAXR * Math.cos(-angleStep), MAXR * Math.sin(-angleStep), 0);
    } else {
        vertices.push(MAXR * Math.cos(0.0), MAXR * Math.sin(0.0), 0);
        vertices.push(MINR * Math.cos(0.0), MINR * Math.sin(0.0), 0);
        vertices.push(MINR * Math.cos(-angleStep), MINR * Math.sin(-angleStep), 0);

    }
    // console.log(vertices.length)
    return vertices;
}
function ringVertices2(num, minR, maxR) {
    let vertices = []
    let angleStep = num / ((num - 1) * num) * 2 * PI;
    vertices.push(maxR * Math.cos(0.0), maxR * Math.sin(0.0), 0);
    vertices.push(minR * Math.cos(0.0), minR * Math.sin(0.0), 0);
    vertices.push(minR * Math.cos(angleStep), minR * Math.sin(angleStep), 0);
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            vertices.push(maxR * Math.cos(angleStep * i), maxR * Math.sin(angleStep * i), 0)
            vertices.push(minR * Math.cos(angleStep * (i - 1)), minR * Math.sin(angleStep * (i - 1)), 0)
            vertices.push(minR * Math.cos(angleStep * (i + 1)), minR * Math.sin(angleStep * (i + 1)), 0)
        } else {
            vertices.push(minR * Math.cos(angleStep * i), minR * Math.sin(angleStep * i), 0)
            vertices.push(maxR * Math.cos(angleStep * (i - 1)), maxR * Math.sin(angleStep * (i - 1)), 0)
            vertices.push(maxR * Math.cos(angleStep * (i + 1)), maxR * Math.sin(angleStep * (i + 1)), 0)
        }
    }
    if (num % 2 == 0) {
        vertices.push(minR * Math.cos(0.0), maxR * Math.sin(0.0), 0);
        vertices.push(maxR * Math.cos(0.0), maxR * Math.sin(0.0), 0);
        vertices.push(maxR * Math.cos(-angleStep), maxR * Math.sin(-angleStep), 0);
    } else {
        vertices.push(maxR * Math.cos(0.0), maxR * Math.sin(0.0), 0);
        vertices.push(minR * Math.cos(0.0), minR * Math.sin(0.0), 0);
        vertices.push(minR * Math.cos(-angleStep), minR * Math.sin(-angleStep), 0);

    }
    // console.log(vertices.length)
    return vertices;
}

function ringTexCoords(num) {
    let ratio = 480 / 640
    let offsetX = (640 - 480) / 640 * 0.5
    let texCoords = []
    let angleStep = num / ((num - 1) * num) * 2 * PI;
    texCoords.push((MAXR * Math.cos(PI + 0.0) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + 0.0) + 1) * 0.5);
    texCoords.push((MINR * Math.cos(PI + 0.0) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + 0.0) + 1) * 0.5);
    texCoords.push((MINR * Math.cos(PI + angleStep) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + angleStep) + 1) * 0.5);
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            texCoords.push((MAXR * Math.cos(PI + angleStep * i) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + angleStep * i) + 1) * 0.5)
            texCoords.push((MINR * Math.cos(PI + angleStep * (i - 1)) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + angleStep * (i - 1)) + 1) * 0.5)
            texCoords.push((MINR * Math.cos(PI + angleStep * (i + 1)) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + angleStep * (i + 1)) + 1) * 0.5)
        } else {
            texCoords.push((MINR * Math.cos(PI + angleStep * i) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + angleStep * i) + 1) * 0.5)
            texCoords.push((MAXR * Math.cos(PI + angleStep * (i - 1)) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + angleStep * (i - 1)) + 1) * 0.5)
            texCoords.push((MAXR * Math.cos(PI + angleStep * (i + 1)) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + angleStep * (i + 1)) + 1) * 0.5)
        }
    }
    if (num % 2 == 0) {
        texCoords.push((MINR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((MAXR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((MAXR * Math.cos(PI + 2 * PI - angleStep) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + 2 * PI - angleStep) + 1) * 0.5);

    } else {

        texCoords.push((MAXR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (MAXR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((MINR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((MINR * Math.cos(PI + 2 * PI - angleStep) + 1) * 0.5 * ratio + offsetX, (MINR * Math.sin(PI + 2 * PI - angleStep) + 1) * 0.5);
    }
    return texCoords;
}
function ringTexCoords2(num, minR, maxR) {
    let ratio = 480 / 640
    let offsetX = (640 - 480) / 640 * 0.5
    let texCoords = []
    let angleStep = num / ((num - 1) * num) * 2 * PI;
    texCoords.push((maxR * Math.cos(PI + 0.0) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + 0.0) + 1) * 0.5);
    texCoords.push((minR * Math.cos(PI + 0.0) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + 0.0) + 1) * 0.5);
    texCoords.push((minR * Math.cos(PI + angleStep) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + angleStep) + 1) * 0.5);
    for (let i = 1; i < num - 1; i++) {
        if (i % 2 == 0) {
            texCoords.push((maxR * Math.cos(PI + angleStep * i) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + angleStep * i) + 1) * 0.5)
            texCoords.push((minR * Math.cos(PI + angleStep * (i - 1)) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + angleStep * (i - 1)) + 1) * 0.5)
            texCoords.push((minR * Math.cos(PI + angleStep * (i + 1)) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + angleStep * (i + 1)) + 1) * 0.5)
        } else {
            texCoords.push((minR * Math.cos(PI + angleStep * i) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + angleStep * i) + 1) * 0.5)
            texCoords.push((maxR * Math.cos(PI + angleStep * (i - 1)) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + angleStep * (i - 1)) + 1) * 0.5)
            texCoords.push((maxR * Math.cos(PI + angleStep * (i + 1)) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + angleStep * (i + 1)) + 1) * 0.5)
        }
    }
    if (num % 2 == 0) {
        texCoords.push((minR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((maxR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((maxR * Math.cos(PI + 2 * PI - angleStep) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + 2 * PI - angleStep) + 1) * 0.5);

    } else {

        texCoords.push((maxR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (maxR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((minR * Math.cos(PI + 2 * PI) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + 2 * PI) + 1) * 0.5);
        texCoords.push((minR * Math.cos(PI + 2 * PI - angleStep) + 1) * 0.5 * ratio + offsetX, (minR * Math.sin(PI + 2 * PI - angleStep) + 1) * 0.5);
    }
    return texCoords;
}

function gridVertices(cols, rows) {
    if (rows < 1) {
        rows = 1
    }
    let vertices = []
    let h = 1.0 / rows;
    // for (let i = 0; i < rows; i++) {
    for (let i = 0; i < 5; i++) {
        vertices.push(...planeVertices(cols + 1, h, i * h));
    }
    return vertices;
}

function gridTexCoords(cols, rows) {
    if (rows < 1) {
        rows = 1
    }
    let texCoords = []
    let h = 1.0 / rows;
    // for (let i = rows - 1; i >= 0; i--) {
    for (let i = rows - 1; i >= rows - 5; i--) {
        texCoords.push(...planeTexCoords(cols + 1, h, i * h));
    }
    return texCoords;
}

function ringGridVertices(cols, rows) {
    if (rows < 1) {
        rows = 1
    }
    let vertices = []
    let r = 1.0 / rows;
    for (let i = 0; i < rows; i++) {
        vertices.push(...ringVertices2(cols, r * i + MINR, r * (i + 1)))
    }
    return vertices;
}
function ringGridTexCoords(cols, rows) {
    if (rows < 1) {
        rows = 1
    }
    let vertices = []
    let r = 1.0 / rows;
    for (let i = 0; i < rows; i++) {
        vertices.push(...ringTexCoords2(cols, r * i + MINR, r * (i + 1)))
    }
    return vertices;
}

function sphereVertices(numX, numY, r = 1) {
    const limitX = Math.PI * 0.5
    const limitY = Math.PI * 2.0
    const stepX = limitX / numX;
    const stepY = limitY / numY;
    let theta = 0;
    let phi = 0;
    let vertices = []
    while (theta < limitX) {
        phi = 0;
        while (phi < limitY) {

            let x = r * Math.sin(theta) * Math.cos(phi)
            let y = r * Math.sin(theta) * Math.sin(phi)
            let z = r * Math.cos(theta)
            vertices.push(x, y, z);
            phi += stepY
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            z = r * Math.cos(theta)
            vertices.push(x, y, z);
            phi -= stepY
            theta += stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            z = r * Math.cos(theta)
            vertices.push(x, y, z);
            vertices.push(x, y, z);
            phi += stepY
            theta -= stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            z = r * Math.cos(theta)
            vertices.push(x, y, z);
            theta += stepX;
            x = r * Math.sin(theta) * Math.cos(phi)
            y = r * Math.sin(theta) * Math.sin(phi)
            z = r * Math.cos(theta)
            vertices.push(x, y, z);
            theta -= stepX;
        }
        theta += stepX;
    }
    return vertices;
}
