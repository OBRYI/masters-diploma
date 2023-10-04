console.log("Калібрування катадіоптричної камери")

let gl, shProg, ctx, div;
let video;
let videoTexture, videoSurface, ringSurface, mouseX = 0, mouseY = 0, mult = 0.33;

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

let callback = (e) => {
    var cRect = canvas.getBoundingClientRect();
    var dRect = div.getBoundingClientRect();
    mouseX = Math.round(e.clientX - cRect.left);
    mouseY = Math.round(e.clientY - cRect.top);
    if (mouseX < dRect.width * 0.5) {
        mouseX = dRect.width * 0.5
    } else if (mouseX > cRect.width - dRect.width * 0.5) {
        mouseX = cRect.width - dRect.width * 0.5
    }
    if (mouseY < dRect.height * 0.5) {
        mouseY = dRect.height * 0.5
    } else if (mouseY > cRect.height - dRect.height * 0.5) {
        mouseY = cRect.height - dRect.height * 0.5
    }
    div.style.left = `${mouseX + cRect.left - dRect.width * 0.5}px`;
    div.style.top = `${mouseY + cRect.top - dRect.height * 0.5}px`;
}

function init() {
    canvas = document.getElementById("cnv3");
    div = document.getElementById('over');
    canvas.addEventListener("mousemove", callback);
    div.addEventListener("mousemove", callback);
    canvas2 = document.getElementById("cnv2");
    gl = canvas.getContext("webgl");
    ctx = canvas2.getContext("2d")
    canvas2.width = window.innerWidth - 640 - 4;
    canvas2.height = 240;
    div.style.width = `${(window.innerWidth - 640 - 4) * mult}px`;
    div.style.height = `${480 * mult}px`;
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - canvas2.height;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight - canvas2.height);

    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    shProg = new ShaderProgram(prog)
    shProg.use()
    shProg.iAttribVertex = gl.getAttribLocation(shProg.prog, "vertex")
    shProg.iAttribTexCoord = gl.getAttribLocation(shProg.prog, "texCoord")
    shProg.iTMU = gl.getUniformLocation(shProg.prog, "tmu")
    shProg.iColor = gl.getUniformLocation(shProg.prog, "color")
    shProg.iScreen = gl.getUniformLocation(shProg.prog, "screen")

    gl.uniform1i(shProg.iTMU, 0);
    gl.uniform4fv(shProg.iColor, [1, 1, 1, 1]);
    gl.uniform2fv(shProg.iScreen, [window.innerWidth, window.innerHeight - canvas2.height]);

    videoTexture = createTexture();
    videoSurface = new Model();
    videoSurface.vertexBufferData(rectVertices())
    videoSurface.textureBufferData(rectTexCoords())
    drawLoop();
}

function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, videoTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    videoSurface.draw()
    ctx.drawImage(canvas, mouseX - canvas2.width * 0.5 * mult, mouseY - canvas2.height * 0.5 * mult, canvas2.width * mult, canvas2.height * mult, 0, 0, canvas2.width, canvas2.height);

}



function drawLoop() {
    draw()
    window.requestAnimationFrame(drawLoop)
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

function rectVertices() {
    let trX = -1
    let trY = - 1
    let multX = 2.0
    let multY = 2.0
    let verts = [
        [0 + trX, 0 + trY, 0],
        [0 + trX, 1 * multY + trY, 0],
        [1 * multX + trX, 1 * multY + trY, 0],
        [1 * multX + trX, 0 + trY, 0]
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