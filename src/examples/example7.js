import PicoGL from "picogl"
import {mat4, vec3} from "gl-matrix"
import vertShader from "../shaders/simplex.vert"
import fragShader from "../shaders/simplex.frag"
import fragShaderSolid from "../shaders/simplexSolid.frag"
import texture from "../img/rainbow.png"
import ObjLoader from "../utils/obj-loader";
import objMesh from "../assets/sphere.obj";

class RenderObject {
    constructor(sceneUniformBuffer, scale, vertShader, fragShader){
        this.sceneUniformBuffer = sceneUniformBuffer;
        this.scale = scale;
        this.modelMatrix = mat4.create();
        this.drawCall = null;
        this.vertShader = vertShader;
        this.fragShader = fragShader;
    }
}

var objects = [
    {scale: [1.16,1.16,1.16], vertShader:vertShader, fragShader:fragShader},
    {scale: [1.1,1.1,1.1], vertShader:vertShader, fragShader:fragShaderSolid}
];

export default class Example7 {
    constructor(app){
        this.app = app;
        this.obj = new ObjLoader(objMesh, true);
        this.init();
        this.initialized = false;
    }

    createSphereVertexArray(){
        var indicesU16 = new Uint16Array(this.obj[0]);
        var pos32 = new Float32Array(this.obj[1]);
        var normals32 = new Float32Array(this.obj[2]);
        var uv32 = new Float32Array(this.obj[3]);

        var positions = this.app.createVertexBuffer(PicoGL.FLOAT, 3,  pos32);
        var uv = this.app.createVertexBuffer(PicoGL.FLOAT, 2,  uv32);
        var normals = this.app.createVertexBuffer(PicoGL.FLOAT, 3,  normals32);
        var indices = this.app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, indicesU16);

        return this.app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .indexBuffer(indices);
    }

    createRenderObjects(sceneUniformBuffer){
        let renderObjects = [];
        for(var i=0;i<objects.length;i++){
            renderObjects.push(new RenderObject(sceneUniformBuffer, objects[i].scale, objects[i].vertShader, objects[i].fragShader));
        }
        return renderObjects;
    }

    init(){
        utils.addTimerElement();

        this.timer = this.app.createTimer();

        this.sphereVertexArray = this.createSphereVertexArray();

        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, this.app.width / this.app.height, 0.1, 10.0);

        var viewMatrix = mat4.create();
        var eyePosition = vec3.fromValues(0, 0, 4);
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

        this.renderObjects = this.createRenderObjects(sceneUniformBuffer);

        this.img = new Image();
        this.img.src = texture;
        this.img.onload = _.bind(this.preloadDone, this);
    }

    preloadDone(){
        var txt = this.app.createTexture2D(this.img, {flipY: true});

        for(var i=0;i<this.renderObjects.length;i++){
            var rObj = this.renderObjects[i];

            rObj.drawCall = this.app.createDrawCall(
                this.app.createProgram(rObj.vertShader, rObj.fragShader),
                this.sphereVertexArray
            )
                .uniformBlock("SceneUniforms", rObj.sceneUniformBuffer)
                .texture("tex", txt);
        }

        this.startTime = performance.now();
        this.initialized = true;
    }

    render(){
        let rObj, i, j;

        if(!this.initialized) return;

        if(this.timer.ready()){
            utils.updateTimerElement(this.timer.cpuTime, this.timer.gpuTime);
        }

        this.timer.start();

        for(i=0;i<this.renderObjects.length;i++){
            rObj = this.renderObjects[i];
            mat4.fromScaling(rObj.modelMatrix, rObj.scale);

            rObj.drawCall.uniform("uModel", rObj.modelMatrix);
            let itemTimeUID = (-i*2)+1;
            rObj.drawCall.uniform("uTime", performance.now() / 1000.0 * itemTimeUID);
        }

        this.app.clear();

        for(j=0;j<this.renderObjects.length;j++){
            rObj = this.renderObjects[j];
            rObj.drawCall.draw();
        }

        this.timer.end();
    }
}