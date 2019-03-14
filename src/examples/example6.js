import PicoGL from "picogl"
import {mat4, vec3} from "gl-matrix"
import vertShader from "../shaders/simplex.vert"
import fragShader from "../shaders/simplex.frag"
import texture from "../img/rainbow.png"
import ObjLoader from "../utils/obj-loader";
import objMesh from "../assets/sphere.obj";

export default class Example6 {
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

        this.sphereArray = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .indexBuffer(indices);

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(0, 0, 4);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0,0,0), vec3.fromValues(0, 0.1, 0));

        var viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

        this.sceneUniformBuffer = this.app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, viewProjMatrix)
            .set(1, eyePosition)
            .update();

        this.modelMatrix = mat4.create();

        this.img = new Image();
        this.img.src = texture;
        this.img.onload = _.bind(this.preloadDone, this);
    }

    preloadDone(){
        var txt = this.app.createTexture2D(this.img, {flipY: true});

        this.drawCall = this.app.createDrawCall(this.program, this.sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", txt);

        this.startTime = performance.now();
        this.initialized = true;
    }

    render(){
        if(!this.initialized) return;

        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }

        this.timer.start();

        this.drawCall.uniform("uModel", this.modelMatrix);
        this.drawCall.uniform("uTime", performance.now() / 1000.0);

        this.app.clear();
        this.drawCall.draw();

        this.timer.end();
    }
}