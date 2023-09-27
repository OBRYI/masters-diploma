class Model {
    constructor() {
        this.iVertexBuffer = gl.createBuffer();
        this.iNormalBuffer = gl.createBuffer();
        this.iTextureBuffer = gl.createBuffer();
    }
    draw() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProg.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProg.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.vertexAttribPointer(shProg.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(shProg.iAttribTexCoord);

        gl.uniform1i(gl.getUniformLocation(shProg.prog, "line"), false);
        gl.drawArrays(gl.TRIANGLES, 0, this.count)
    }
    drawStroke() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProg.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProg.iAttribVertex);

        gl.uniform1i(gl.getUniformLocation(shProg.prog, "line"), true);
        gl.drawArrays(gl.LINE_STRIP, 0, this.count)

    }
    vertexBufferData(vertices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
        this.count = vertices.length / 3;
    }
    normalBufferData(normals) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);
    }
    textureBufferData(texCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STREAM_DRAW);
    }
}