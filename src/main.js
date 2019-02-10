import {_} from "underscore";
import PicoGL from "picogl";
import Example1 from "./examples/example1"
import Example2 from "./examples/example2"
import Example3 from "./examples/example3"
import Example4 from "./examples/example4"
import Example5 from "./examples/example5"
import Example6 from "./examples/example6"
import Example6b from "./examples/example6b"
import Example7 from "./examples/example7"
import Example8 from "./examples/example8"

export class Main{
    constructor(){
        if(!utils.testWebGL2()){
            console.log.error("WebGL2 not available");
        }
        //this.$canvas.width = window.innerWidth;
        //this.$canvas.height = window.innerHeight;
        var $canvas = document.getElementById("main-canvas");
        this.app = PicoGL.createApp($canvas)
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .depthFunc(PicoGL.LESS)
            .blend()
            .blendFunc(PicoGL.SRC_ALPHA, PicoGL.ONE_MINUS_SRC_ALPHA);

        window.onresize = function(){
            this.app.resize(window.innerWidth, window.innerHeight);
        };

        this.example = new Example8(this.app);
        window.requestAnimationFrame(_.bind(this.render, this));
    }

    render(){
        this.example.render();
        window.requestAnimationFrame(_.bind(this.render, this));
    }

}
var main = new Main();