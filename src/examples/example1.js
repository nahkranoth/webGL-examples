import {_} from "underscore"
import PicoGL from "picogl"
import fragShader from "../shaders/simple.frag"
import vertShader from "../shaders/simple.vert"


//In this example I create a simple triangle with a polar flat shader

export default class Example1{

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
            -0.5, -0.5,
            0.5, -0.5,
            0.0, 0.5
        ]));

        var colors = this.app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]));

        var triangleArray = this.app.createVertexArray().
        vertexAttributeBuffer(0, positions).
        vertexAttributeBuffer(1, colors);

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