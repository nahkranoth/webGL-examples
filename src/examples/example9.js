import * as PicoGL from "picogl";
import {mat4, vec3} from "gl-matrix";
import vertShaderUpdate from "../shaders/offsetFeedbackTransform.vert"
import fragShaderUpdate from "../shaders/offsetFeedbackTransform.frag"
import vertShaderInit from "../shaders/offsetInitTransform.vert"
import fragShaderInit from "../shaders/offsetInitTransform.frag"

export default class Example8{
    constructor(app){
        this.app = app;
        this.init();
    }

    init(){
        utils.addTimerElement();

        if (!utils.testWebGL2()) {
            console.error("WebGL 2 not available");
            document.body.innerHTML = "This example requires WebGL 2 which is unavailable on this system."
        }

        this.timer = this.app.createTimer();

        // FINAL ARGUMENT IS TRANSFORM FEEDBACK VARYINGS
        var updateProgram = this.app.createProgram(vertShaderUpdate, fragShaderUpdate, ["vOffset", "vRotation"]);

        // DRAW PROGRAM

        var drawProgram = this.app.createProgram(vertShaderInit, fragShaderInit);

        // GEO DATA
        var NUM_INSTANCES = 50000;

        var offsetData = new Float32Array(NUM_INSTANCES * 2);
        var rotationData = new Float32Array(NUM_INSTANCES);
        var colorData = new Uint8Array(NUM_INSTANCES * 3);
        var positionData = new Float32Array([
            0.012, 0.0,
            -0.008, 0.008,
            -0.008, -0.008,
        ]);

        for (var i = 0; i < NUM_INSTANCES; ++i) {
            var oi = i * 2;
            var ri = i;
            var ci = i * 3;

            offsetData[oi] = Math.random() * 2.0 - 1.0;
            offsetData[oi + 1] = Math.random() * 2.0 - 1.0;

            rotationData[i] = Math.random() * 2 * Math.PI;

            colorData[ci]     = Math.floor(Math.random() * 256);
            colorData[ci + 1] = Math.floor(Math.random() * 256);
            colorData[ci + 2] = Math.floor(Math.random() * 256);
        }

        // INPUT AND OUTPUT VERTEX BUFFERS
        var offsetsA = this.app.createVertexBuffer(PicoGL.FLOAT, 2, offsetData);
        var offsetsB = this.app.createVertexBuffer(PicoGL.FLOAT, 2, offsetData.length);

        var rotationsA = this.app.createVertexBuffer(PicoGL.FLOAT, 1, rotationData);
        var rotationsB = this.app.createVertexBuffer(PicoGL.FLOAT, 1, rotationData.length);


        // ATTRIBUTES FOR DRAWING
        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 2, positionData);
        var colors = this.app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, colorData);


        // COMBINE VERTEX BUFFERS INTO INPUT AND OUTPUT VERTEX ARRAYS
        var updateArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, offsetsA)
            .vertexAttributeBuffer(1, rotationsA);

        var updateArrayB = this.app.createVertexArray()
            .vertexAttributeBuffer(0, offsetsB)
            .vertexAttributeBuffer(1, rotationsB);

        // CREATE TRANSFORM FEEDBACK FROM INPUT AND OUTPUT VERTEX ARRAYS
        var transformFeedbackA = this.app.createTransformFeedback()
            .feedbackBuffer(0, offsetsA)
            .feedbackBuffer(1, rotationsA);

        var transformFeedbackB = this.app.createTransformFeedback()
            .feedbackBuffer(0, offsetsB)
            .feedbackBuffer(1, rotationsB);

        // VERTEX ARRAYS FOR DRAWING
        var drawArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceNormalizedAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, offsetsA)
            .instanceAttributeBuffer(3, rotationsA);

        var drawArrayB = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceNormalizedAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, offsetsB)
            .instanceAttributeBuffer(3, rotationsB);

        // CREATE DRAW CALLS FOR SIMULATION
        // A BUFFERS AS INPUT, UPDATE B BUFFERS
        this.updateDrawCallA = this.app.createDrawCall(updateProgram, updateArrayA, PicoGL.POINTS)
            .transformFeedback(transformFeedbackB);

        // B BUFFERS AS INPUT, UPDATE A BUFFERS
        this.updateDrawCallB = this.app.createDrawCall(updateProgram, updateArrayB, PicoGL.POINTS)
            .transformFeedback(transformFeedbackA);

        // DRAW USING CONTENTS OF A BUFFERS
        this.drawCallA = this.app.createDrawCall(drawProgram, drawArrayA);

        // DRAW USING CONTENTS OF B BUFFERS
        this.drawCallB = this.app.createDrawCall(drawProgram, drawArrayB);

        this.updateDrawCall = this.updateDrawCallA;
        this.mainDrawCall = this.drawCallB;
    }

    render(){

        if (this.timer.ready()) {
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }

        this.timer.start();

        // TRANSFORM FEEDBACK
        this.app.noRasterize();
        this.updateDrawCall.draw();

        // DRAW
        this.app.rasterize().clear();
        this.mainDrawCall.draw();

        // SWAP INPUT AND OUTPUT BUFFERS
        this.updateDrawCall = this.updateDrawCall === this.updateDrawCallA ? this.updateDrawCallB : this.updateDrawCallA;
        this.mainDrawCall = this.mainDrawCall === this.drawCallA ? this.drawCallB : this.drawCallA;

        this.timer.end();
    }
}
