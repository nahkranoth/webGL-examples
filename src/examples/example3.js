import {_} from "underscore"
import PicoGL from "picogl"
import fragShader from "../shaders/simpleInstanced.frag"
import vertShader from "../shaders/simpleInstanced.vert"


//In this example I create a simple instanced triangles; look at createVertexArray where I pass a INSTANCEAttributeBuffer,
//meaning; Per instance of the arrays length (mind it's a vec2 sized array), I get the 2 values

export default class Example3{

    constructor(app){
        this.app = app;
        console.log("HELLO FELLOW HUMAN");
        this.init();
    }

    init(){
        var vsSource = vertShader;
        var fsSource = fragShader;
        var program = this.app.createProgram(vsSource, fsSource);

        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -0.3, -0.3,
            0.3, -0.3,
            0.0, 0.3
        ]));

        var offsets = this.app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -0.4, -0.4,
            0.4, -0.4,
            -0.4, 0.4,
            0.4, 0.4
        ]));

        var colors = this.app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
            255, 0, 0,
            0, 255, 0,
            0, 0, 255,
            0, 255, 255
        ]));

        var triangleArray = this.app.createVertexArray().
        vertexAttributeBuffer(0, positions).
        instanceAttributeBuffer(1, offsets).
        instanceAttributeBuffer(2, colors);

        this.drawCall = this.app.createDrawCall(program , triangleArray);

    }

    render(){
        this.app.clear();
        this.drawCall.draw();
    }

    delete(){
        program.delete();
        positions.delete();
        colors.delete();
        triangleArray.delete();
    }
}