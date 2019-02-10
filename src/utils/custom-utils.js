import {mat4, vec3} from "gl-matrix"

export default class FacesDepthSorter{

    /**
     *
     * @param vm_transform Float32Array ViewModel matrix
     * @param vertices Float32Array vertices from model
     */
    constructor(viewMatrix, modelMatrix, indices, vertices){
        this.viewMatrix = viewMatrix;
        this.modelMatrix = modelMatrix;
        this.vertices = vertices;
        this.indices = indices;
        this.amount_of_triangles = indices.length/3;
        this.sorter = new FloatInsertSorter(this.amount_of_triangles);
    }

    sort(){
        var k = 0, max_z = 10e10;
        for(var j=0;j<this.amount_of_triangles;j++){
            var which_triangle = this.sorter.sort_indexes[j][0];
            k = which_triangle * 3 * 3;
            var one_vertex = [];
            var indices_group = [];
            for (var n = 0; n < 3; n += 1, k += 3) {

                indices_group = [this.indices[k], this.indices[k+1], this.indices[k+2]];

                console.log(this.indices);
                one_vertex[0] = this.vertices[this.indices[k]];
                one_vertex[1] = this.vertices[this.indices[k+1]];
                one_vertex[2] = this.vertices[this.indices[k+2]];
                var transformed_vertex = vec3.create();
                vec3.transformMat4(transformed_vertex, one_vertex, this.modelMatrix);

                if (transformed_vertex[2] < max_z) {
                    max_z = transformed_vertex[2];
                }
            }

            //console.log(1-transform_vertex2[2]);
           this.sorter.sort_indexes[j][1] = max_z;
           this.sorter.sort_indexes[j][2] = indices_group;
        }
        this.sorter.sort();

        var sorted_indices = [];
        for(var i=0;i<this.sorter.sort_indexes.length;i++){
            sorted_indices.push(this.sorter.sort_indexes[i][2][0]);
            sorted_indices.push(this.sorter.sort_indexes[i][2][1]);
            sorted_indices.push(this.sorter.sort_indexes[i][2][2]);
        }

        return new Uint16Array(sorted_indices);
    }
}

export class FloatInsertSorter{
     constructor(length){
         //construct sort index; a 2d array with elements containing [id, distance_from_camera]
         this.sort_indexes = null;
         this.length = length;
         if(length > 0){
             this.sort_indexes = new Array(this.length);
            for(var j = 0; j < length; j ++) {
                this.sort_indexes[j] = [j, Math.random(), [0,0,0]];
            }
         }
     }

     sort(){
        //insert-sort sort indexes
        for(var j=0;j<this.length;j++){
            var temp = this.sort_indexes[j];
            var k = j-1;
            while(k >= 0 && this.sort_indexes[k][1] > temp[1]){
                this.sort_indexes[k+1] = this.sort_indexes[k];
                k -= 1;
            }
            this.sort_indexes[k+1] = temp;
        }
     }
}