import {_} from "underscore"
import PicoGL from "picogl"
import fragShader from "../shaders/simpleUBuffer.frag"
import vertShader from "../shaders/simpleUBuffer.vert"


//In this example I create a simple triangle with a polar flat shader

export default class Example2{

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
            -0.4, -0.4,
            0.4, -0.4,
            0.0, 0.4
        ]));

        var triangleArray = this.app.createVertexArray().
            vertexAttributeBuffer(0, positions);

        var uniformBuffer1 = this.app.createUniformBuffer([
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC2
        ])
            .set(0, new Float32Array([0.0, 0.0, 1.0, 1.0]))
            .set(1, new Float32Array([0.5, 0.0]))
            .update();

        var uniformBuffer2 = this.app.createUniformBuffer([
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC2
        ])
            .set(0, new Float32Array([1.0, 0.0, 0.0, 1.0]))
            .set(1, new Float32Array([-0.5, 0.0]))
            .update();


        this.drawCall1 = this.app.createDrawCall(program , triangleArray).uniformBlock("TriangleUniforms", uniformBuffer1);
        this.drawCall2 = this.app.createDrawCall(program , triangleArray).uniformBlock("TriangleUniforms", uniformBuffer2);

    }

    render(){
        this.app.clear();
        this.drawCall1.draw();
        this.drawCall2.draw();
    }

    delete(){
        // program.delete();
        // positions.delete();
        // colors.delete();
        // triangleArray.delete();
        // uniformBuffer1.delete();
        // uniformBuffer2.delete();
    }
}