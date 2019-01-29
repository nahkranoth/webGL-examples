import PicoGL from "picogl"
import _ from "underscore"
import {mat4, vec3} from "../utils/gl-matrix"
import vertShader from "../shaders/simplePlane.vert"
import fragShader from "../shaders/simplePlane.frag"
import texture from "../img/box.jpg"
import ObjectLoader from "../utils/obj-loader"
import objMesh from "../assets/cube.obj"


export default class Example6 {
    constructor(app){
        this.app = app;
        this.objLoader = new ObjectLoader(objMesh);
        this.init();
        this.initialized = false;

    }

    init(){
        utils.addTimerElement();

        this.timer = this.app.createTimer();

        var vsSource = vertShader;
        var fsSource =  fragShader;

        this.program = this.app.createProgram(vsSource, fsSource);

        var box = utils.createBox({dimensions: [1.0, 1.0, 1.0]});

        console.log("OBJ MESH: ");
        console.log();

        // var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        // var uv = this.app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
        // var normals = this.app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

        var pos32 = new Float32Array(this.objLoader.vertices);
        var uv32 = new Float32Array(this.objLoader.uvs);
        var normals32 = new Float32Array(this.objLoader.normals);

        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3, pos32);
        var uv = this.app.createVertexBuffer(PicoGL.FLOAT, 2, uv32);
        var normals = this.app.createVertexBuffer(PicoGL.FLOAT, 3, normals32);
        //var uv = objMesh.;
        //var normals = objMesh.vertexNormals''

        this.boxArray = this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0,0,0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, projMatrix, viewMatrix);

        var lightPosition = vec3.fromValues(1, 1, 0.5);

        this.sceneUniformBuffer = this.app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
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
        console.log("test");
    }

    preloadDone(){
        var txt = this.app.createTexture2D(this.img, {flipY: true});

        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        this.drawCall = this.app.createDrawCall(this.program, this.boxArray, PicoGL.LINES )
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", txt);
        console.log(this.drawCall);
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
        //console.log(this.drawCall);
        this.app.clear();
        this.drawCall.draw();

        this.timer.end();
    }
}