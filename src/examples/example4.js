import * as PicoGL from "picogl";
import vertShader from "../shaders/simpleFeedbackTransform.vert"
import fragShader from "../shaders/simpleFeedbackTransform.frag"

export default class Example4{
    constructor(app){
        this.app = app;
        this.init();
    }

    init(){
        utils.addTimerElement();
        this.timer = this.app.createTimer();
        var vsSource = vertShader;
        var fsSource = fragShader;
        var program = this.app.createProgram(vsSource, fsSource, ["vPosition"]);//note last array defining feedback vars

        var positions1 = this.app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -0.3, -0.3,
            0.3, -0.3,
            0.0, 0.3
        ]));

        var positions2 = this.app.createVertexBuffer(PicoGL.FLOAT, 2, 6);

        var colors = this.app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]));



        //TODO: This could be simplified through wrappers I assume:
        //a wrapping feedbackVertexBuffer that creates 2 versions (1 filled, one empty)

        var triangleArrayA = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions1)
            .vertexAttributeBuffer(1, colors);

        var triangleArrayB = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions2)
            .vertexAttributeBuffer(1, colors);

        var transformFeedbackA = this.app.createTransformFeedback()
            .feedbackBuffer(0, positions1);

        var transformFeedbackB = this.app.createTransformFeedback()
            .feedbackBuffer(0, positions2);

        this.drawCallA = this.app.createDrawCall(program, triangleArrayA)
            .transformFeedback(transformFeedbackB);

        this.drawCallB = this.app.createDrawCall(program, triangleArrayB)
            .transformFeedback(transformFeedbackA);

        this.currentDrawCall = this.drawCallA;
    }

    render(){
        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }
        this.timer.start();
        this.app.clear();
        this.currentDrawCall.draw();

        this.currentDrawCall = this.currentDrawCall === this.drawCallA ? this.drawCallB : this.drawCallA;

        this.timer.end();
    }
}
