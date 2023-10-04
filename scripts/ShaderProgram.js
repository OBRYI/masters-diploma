class ShaderProgram {
    constructor(prog) {
        this.prog = prog;
        this.iAttribVertex = -1;
        this.iAttribNormal = -1;
        this.iAttribTexCoord = -1;
        this.iColor = -1;
        this.iTMU = -1;
    }
    use() {
        gl.useProgram(this.prog);
    }
}