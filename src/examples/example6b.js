import PicoGL from "picogl"
import {mat4, vec3} from "gl-matrix"
import vertShader from "../shaders/simpleCube.vert"
import fragShader from "../shaders/simpleCube.frag"
import texture from "../img/box.jpg"
import ObjLoader from "../utils/obj-loader";
import objMesh from "../assets/thetra.obj";

export default class Example6b {
    constructor(app){
        this.app = app;
        this.obj = new ObjLoader(objMesh, true);
        this.init();
        this.initialized = false;
    }

    init(){
        utils.addTimerElement();

        this.timer = this.app.createTimer();

        var vsSource = vertShader;
        var fsSource =  fragShader;

        this.program = this.app.createProgram(vsSource, fsSource);

        var indicesU16 = new Uint16Array(this.obj[0]);
        var pos32 = new Float32Array(this.obj[1]);
        var normals32 = new Float32Array(this.obj[2]);
        var uv32 = new Float32Array(this.obj[3]);

        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3,  pos32);
        var uv = this.app.createVertexBuffer(PicoGL.FLOAT, 2,  uv32);
        var normals = this.app.createVertexBuffer(PicoGL.FLOAT, 3,  normals32);
        var indices = this.app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, indicesU16);

        this.boxArray = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .indexBuffer(indices);

        console.log(this.boxArray);

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(0, 0, 3);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0,0,0), vec3.fromValues(0, 0.1, 0));

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
        this.drawCall = this.app.createDrawCall(this.program, this.boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer);

        this.startTime = performance.now();
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
        this.drawCall.uniform("uTime", performance.now() / 1000.0);
        this.app.clear();
        this.drawCall.draw();

        this.timer.end();
    }
}