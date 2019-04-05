import PicoGL from "picogl"
import _ from "underscore"
import {mat4, vec3} from "../utils/gl-matrix"
import vertShader from "../shaders/simpleCube.vert"
import fragShader from "../shaders/simpleCube.frag"
import texture from "../img/box.jpg"

export default class Example5 {
    constructor(app){
        this.app = app;
        this.init();
        this.initialized = false;
    }

    init(){
        utils.addTimerElement();

        this.timer = this.app.createTimer();

        this.program = this.app.createProgram(vertShader, fragShader);

        var box = utils.createBox({dimensions: [1.0, 1.0, 1.0]});
        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        var uv = this.app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
        var normals = this.app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

        this.boxArray = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0,0,0), vec3.fromValues(0, 1, 0));

        var viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

        var lightPosition = vec3.fromValues(1, 1, 0.5);

        this.sceneUniformBuffer = this.app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        this.modelMatrix = mat4.create();
        this.rotateXMatrix = mat4.create();
        this.rotateYMatrix = mat4.create();

        this.angleX = 0;
        this.angleY = 0;

        this.img = new Image();
        this.img.src = texture;
        this.img.onload = _.bind(this.preloadDone, this);
    }

    preloadDone(){
        console.log(this.img);
        var txt = this.app.createTexture2D(this.img, {flipY: true});

        this.drawCall = this.app.createDrawCall(this.program, this.boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", txt);

        this.initialized = true;
    }

    render(){
        if(!this.initialized) return;

        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }

        this.timer.start();

        this.angleX += 0.01;
        this.angleY += 0.02;

        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);

        this.drawCall.uniform("uModel", this.modelMatrix);
        this.app.clear();
        this.drawCall.draw();

        this.timer.end();
    }
}
