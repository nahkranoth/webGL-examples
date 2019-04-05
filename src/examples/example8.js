import _ from "underscore"
import * as PicoGL from "picogl";
import vertShader from "../shaders/offsetInitTransform.vert"
import fragShader from "../shaders/offsetInitTransform.frag"
import vsSourceUpdate from "../shaders/offsetFeedbackTransform.vert"
import fsSourceUpdate from "../shaders/offsetFeedbackTransform.frag"
import {mat4, vec3} from "gl-matrix";


/*TODO: Even in the direct copy of picogl feedback code I get screen flicker - curious how it runs on Windows.
* TODO: Note that the shaders for this example are incorrect at the moment.
* */

export default class Example8{
    constructor(app){
        this.app = app;
        this.init();
    }

    init(){
        utils.addTimerElement();
        this.timer = this.app.createTimer();

        var initProgram = this.app.createProgram(vertShader, fragShader);

        var updateProgram = this.app.createProgram(vsSourceUpdate, fsSourceUpdate, ["vPosition"]);

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(0, 0, 30);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0,0,0), vec3.fromValues(0, 0.1, 0));

        var viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

        let sceneUniformBuffer = this.app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, viewProjMatrix)
            .set(1, eyePosition)
            .update();


        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
            -0.04, -0.04,  0.04,
            0.04, -0.04,  0.04,
            0.04,  0.04,  0.04,
            -0.04,  0.04,  0.04
        ]));

        var colors = this.app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
            0, 0, 1
        ]));

        var INSTANCE_AMOUNT = 3000;
        var offsetData = new Float32Array(INSTANCE_AMOUNT * 3);

        for(var i=0;i<INSTANCE_AMOUNT;i++){
            var oi = i * 3;
            offsetData[oi] = Math.random() * 2.0 - 1.0;
            offsetData[oi+1] = Math.random() * 2.0 - 1.0;
            offsetData[oi+2] = (i/3000)-0.04;
        }

        var offsetsInput = this.app.createVertexBuffer(PicoGL.FLOAT, 3, offsetData);
        var offsetsOutput = this.app.createVertexBuffer(PicoGL.FLOAT, 3, offsetData.length);

        var indices = this.app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, new Uint16Array([
            0, 1, 2, 0, 2, 3
        ]));

        var updateArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, offsetsInput);

        var updateArrayB = this.app.createVertexArray()
            .vertexAttributeBuffer(0, offsetsOutput);

        var transformFeedbackA = this.app.createTransformFeedback()
            .feedbackBuffer(0, offsetsInput);

        var transformFeedbackB = this.app.createTransformFeedback()
            .feedbackBuffer(0, offsetsOutput);

        var triangleArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, offsetsInput)
            .indexBuffer(indices);

        var triangleArrayB = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, offsetsOutput)
            .indexBuffer(indices);

        //DrawCalls

        this.drawCallA = this.app.createDrawCall(initProgram, triangleArrayA).uniformBlock("SceneUniforms", sceneUniformBuffer);
        this.drawCallB = this.app.createDrawCall(initProgram, triangleArrayB).uniformBlock("SceneUniforms", sceneUniformBuffer);

        this.updateDrawCallA = this.app.createDrawCall(updateProgram, updateArrayA).transformFeedback(transformFeedbackB);
        this.updateDrawCallB = this.app.createDrawCall(updateProgram, updateArrayB).transformFeedback(transformFeedbackA);

        this.updateDrawCall = this.updateDrawCallA;
        this.mainDrawCall = this.drawCallB;
    }

    render(){
        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }

        this.timer.start();
        this.app.rasterize().clear();

        // TRANSFORM FEEDBACK
        this.app.noRasterize(); //note turning rasterization off for feedback
        this.updateDrawCall.draw();

        // DRAW
        this.app.rasterize().clear();
        this.mainDrawCall.draw();

        this.updateDrawCall = this.updateDrawCall === this.updateDrawCallA ? this.updateDrawCallB : this.updateDrawCallA;
        this.mainDrawCall = this.mainDrawCall === this.drawCallA ? this.drawCallB : this.drawCallA;

        this.timer.end();
    }
}
