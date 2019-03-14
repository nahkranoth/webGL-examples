import _ from "underscore"
import * as PicoGL from "picogl";
import vertShader from "../shaders/offsetFeedbackTransform.vert"
import fragShader from "../shaders/offsetFeedbackTransform.frag"
import {mat4, vec3} from "gl-matrix";

export default class Example8{
    constructor(app){
        this.app = app;
        this.init();
    }

    init(){
        utils.addTimerElement();
        this.timer = this.app.createTimer();
        var vsSource = vertShader;
        var fsSource = fragShader;
        var program = this.app.createProgram(vsSource, fsSource);//note last array defining feedback vars

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



        var positions1 = this.app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
            -0.04, -0.04,  0.04,
            0.04, -0.04,  0.04,
            0.04,  0.04,  0.04,
            -0.04,  0.04,  0.04
        ]));

        //var positions2 = this.app.createVertexBuffer(PicoGL.FLOAT, 2, 6);

        var colors = this.app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
            0, 0, 1
        ]));

        var INSTANCE_AMOUNT = 3000;
        var offsetData = new Float32Array(INSTANCE_AMOUNT * 2);

        for(var i=0;i<INSTANCE_AMOUNT;i++){
            var oi = i * 3;
            offsetData[oi] = Math.random() * 2.0 - 1.0;
            offsetData[oi+1] = Math.random() * 2.0 - 1.0;
            offsetData[oi+2] = (i/3000)-0.04;
        }

        //Sort offset data [1, 2, 3] op elke 3de value


        //var sortedOffsetData = _.sortBy(offsetData, function(o, i) {  return o[i % 3]; });

        var offsets = this.app.createVertexBuffer(PicoGL.FLOAT, 3, offsetData);

        var indices = this.app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, new Uint16Array([
            0, 1, 2, 0, 2, 3
        ]));

        var triangleArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions1)
            .vertexAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, offsets)
            .indexBuffer(indices);

        // var triangleArrayB = this.app.createVertexArray()
        //     .vertexAttributeBuffer(0, positions2)
        //     .vertexAttributeBuffer(1, colors);
        //
        // var transformFeedbackA = this.app.createTransformFeedback()
        //     .feedbackBuffer(0, positions1);

        // var transformFeedbackB = this.app.createTransformFeedback()
        //     .feedbackBuffer(0, positions2);


        this.drawCallA = this.app.createDrawCall(program, triangleArrayA).uniformBlock("SceneUniforms", sceneUniformBuffer);
            //.transformFeedback(transformFeedbackB);
        //
        // this.drawCallB = this.app.createDrawCall(program, triangleArrayB)
        //     .transformFeedback(transformFeedbackA);

        this.currentDrawCall = this.drawCallA;
    }

    render(){
        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }
        this.timer.start();
        this.app.clear();
        this.currentDrawCall.draw();

        //this.currentDrawCall = this.currentDrawCall === this.drawCallA ? this.drawCallB : this.drawCallA;

        this.timer.end();
    }
}