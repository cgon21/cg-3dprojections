import * as CG from './transforms.js';
import { Matrix, Vector } from "./matrix.js";

const LEFT = 32; // binary 100000
const RIGHT = 16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP = 4;  // binary 000100
const FAR = 2;  // binary 000010
const NEAR = 1;  // binary 000001
const FLOAT_EPSILON = 0.000001;
const step = 5;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // repeat for each model
        for (let i = 0; i < this.scene.models.length; i++) {
            // check for animation property in the model
            if (!this.scene.models[i].hasOwnProperty("animation")) {
                continue;
            }

            // find models vertices
            let vertices = this.scene.models[i].vertices;

            // set the axis for rotation
            let axis = this.scene.models[i].animation[0];
            let axisX = 0, axisY = 0, axisZ = 0;
            if (axis.includes("x")) {
                axisX = 1;
            }
            if (axis.includes("y")) {
                axisY = 1;
            }
            if (axis.includes("z")) {
                axisZ = 1;
            }


            // find the center of the object
            let centerX = 0, centerY = 0, centerZ = 0;
            for (let j = 0; j < vertices.length; j++) {
                centerX += vertices[j].x;
                centerY += vertices[j].y;
                centerZ += vertices[j].z;
            }
            centerX /= vertices.length;
            centerY /= vertices.length;
            centerZ /= vertices.length;

            // define rotation axis and speed
            let rps = this.scene.models[i].animation[1];
            let rotationSpeed = Math.PI * 2 * rps;

            // current angle
            let angle = rotationSpeed * delta_time / 1000;

            // rotate each point
            for (let j = 0; j < vertices.length; j++) {
                let cosTheta = Math.cos(angle);
                let sinTheta = Math.sin(angle);

                // move each point back to center
                let x = vertices[j].x - centerX;
                let y = vertices[j].y - centerY;
                let z = vertices[j].z - centerZ;

                // calculate new points using Rodrigues rotation formula
                let newX = (cosTheta + (1 - cosTheta) * axisX * axisX) * x + ((1 - cosTheta) * axisX * axisY - sinTheta * axisZ) * y + ((1 - cosTheta) * axisX * axisZ + sinTheta * axisY) * z;
                let newY = ((1 - cosTheta) * axisY * axisX + sinTheta * axisZ) * x + (cosTheta + (1 - cosTheta) * axisY * axisY) * y + ((1 - cosTheta) * axisY * axisZ - sinTheta * axisX) * z;
                let newZ = ((1 - cosTheta) * axisZ * axisX - sinTheta * axisY) * x + ((1 - cosTheta) * axisZ * axisY + sinTheta * axisX) * y + (cosTheta + (1 - cosTheta) * axisZ * axisZ) * z;

                // move each point to original spot
                vertices[j].x = newX + centerX;
                vertices[j].y = newY + centerY;
                vertices[j].z = newZ + centerZ;
            }
            // replace vertices array
            this.scene.models[i].vertices = vertices;
        }

        this.draw();
    }
    //
    rotateLeft() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;
        let vup = this.scene.view.vup;
        // create n-axis, u-axis, v-axis, CW, and DOP
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();

        let u = new Vector(3);
        u = vup.cross(n);
        u.normalize();

        let v = new Vector(3);
        v = n.cross(u);

        // 1. translate PRP to origin
        let translateMat = new Matrix(4, 4);
        CG.mat4x4Translate(translateMat, -prp.x, -prp.y, -prp.z);

        console.log(srp);
        // 2. rotate VRC such that (u,v,n) align with (x,y,z)
        let rotateMat = new Matrix(4, 4);
        rotateMat.values = [
            [u.x, u.y, u.z, 0],
            [v.x, v.y, v.z, 0],
            [n.x, n.y, n.z, 0],
            [0, 0, 0, 1]
        ];

        // 3. rotate SRP around v-axis (aligned with y-axis)
        let rotateYMat = new Matrix(4, 4);
        CG.mat4x4RotateY(rotateYMat, step * Math.PI / 180);
        let srp4 = CG.Vector4(srp.x, srp.y, srp.z, 1);
        let rotatedSRP = Matrix.multiply([rotateYMat, rotateMat, translateMat, srp4]);

        // 4. undo step 2
        let invrseRotateMat = rotateMat.inverse();

        // 5. undo step 1
        let inverseTranslateMat = translateMat.inverse();

        // 6. multiply steps 5 and 6
        let finalSRP = Matrix.multiply([inverseTranslateMat, invrseRotateMat, rotatedSRP]);
        this.scene.view.srp = CG.Vector3(
            finalSRP.x / finalSRP.w,
            finalSRP.y / finalSRP.w,
            finalSRP.z / finalSRP.w
        );

        // draw new scene
        this.draw();
    }

    //
    rotateRight() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;
        let vup = this.scene.view.vup;
        // create n-axis, u-axis, v-axis, CW, and DOP
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();

        let u = new Vector(3);
        u = vup.cross(n);
        u.normalize();

        let v = new Vector(3);
        v = n.cross(u);

        // 1. translate PRP to origin
        let translateMat = new Matrix(4, 4);
        CG.mat4x4Translate(translateMat, -prp.x, -prp.y, -prp.z);

        console.log(srp);
        // 2. rotate VRC such that (u,v,n) align with (x,y,z)
        let rotateMat = new Matrix(4, 4);
        rotateMat.values = [
            [u.x, u.y, u.z, 0],
            [v.x, v.y, v.z, 0],
            [n.x, n.y, n.z, 0],
            [0, 0, 0, 1]
        ];

        // 3. rotate SRP around v-axis (aligned with y-axis)
        let rotateYMat = new Matrix(4, 4);
        CG.mat4x4RotateY(rotateYMat, -step * Math.PI / 180);
        let srp4 = CG.Vector4(srp.x, srp.y, srp.z, 1);
        let rotatedSRP = Matrix.multiply([rotateYMat, rotateMat, translateMat, srp4]);

        // 4. undo step 2
        let invrseRotateMat = rotateMat.inverse();

        // 5. undo step 1
        let inverseTranslateMat = translateMat.inverse();

        // 6. multiply steps 5 and 6
        let finalSRP = Matrix.multiply([inverseTranslateMat, invrseRotateMat, rotatedSRP]);
        this.scene.view.srp = CG.Vector3(
            finalSRP.x / finalSRP.w,
            finalSRP.y / finalSRP.w,
            finalSRP.z / finalSRP.w
        );

        // draw new scene
        this.draw();
    }

    // Negative direction on u-axis
    moveLeft() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;
        let vup = this.scene.view.vup;
        // create n-axis and u-axis
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();

        let u = new Vector(3);
        u = vup.cross(n);
        u.normalize();

        // update prp and srp
        this.scene.view.prp.x -= u.x * step;
        this.scene.view.srp.x -= u.x * step;
        this.scene.view.prp.y -= u.y * step;
        this.scene.view.srp.y -= u.y * step;
        this.scene.view.prp.z -= u.z * step;
        this.scene.view.srp.z -= u.z * step;

        // draw new scene
        this.draw();
    }

    // Positive direction on u-axis
    moveRight() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;
        let vup = this.scene.view.vup;

        // create n-axis and u-axis
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();

        let u = new Vector(3);
        u = vup.cross(n);
        u.normalize();

        // update prp and srp
        this.scene.view.prp.x += u.x * step;
        this.scene.view.srp.x += u.x * step;
        this.scene.view.prp.y += u.y * step;
        this.scene.view.srp.y += u.y * step;
        this.scene.view.prp.z += u.z * step;
        this.scene.view.srp.z += u.z * step;

        // draw new scene
        this.draw();
    }

    // Negative direction on n-axis
    moveBackward() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;

        // create n-axis
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();

        // update prp and srp
        this.scene.view.prp.x += n.x * step;
        this.scene.view.srp.x += n.x * step;
        this.scene.view.prp.y += n.y * step;
        this.scene.view.srp.y += n.y * step;
        this.scene.view.prp.z += n.z * step;
        this.scene.view.srp.z += n.z * step;

        // draw new scene
        this.draw();
    }

    // Positive direction on n-axis
    moveForward() {
        let srp = this.scene.view.srp;
        let prp = this.scene.view.prp;

        // create n-axis
        let n = new Vector(3);
        n = prp.subtract(srp);
        n.normalize();


        // update prp and srp
        this.scene.view.prp.x -= n.x * step;
        this.scene.view.srp.x -= n.x * step;
        this.scene.view.prp.y -= n.y * step;
        this.scene.view.srp.y -= n.y * step;
        this.scene.view.prp.z -= n.z * step;
        this.scene.view.srp.z -= n.z * step;

        // draw new scene
        this.draw();
    }


    //
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //     * For each line segment in each edge
        //     * clip in 3D
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line

        // Get the perspective transformation matrix for the current view
        const { prp, srp, vup, clip } = this.scene.view;
        let transformMat = CG.mat4x4Perspective(prp, srp, vup, clip);

        // For each model in the scene
        this.scene.models.forEach(model => {
            // For each vertex in the model
            let newVertices = model.vertices.map(vertex => {
                // Transform vertex to canonical view volume
                let newVertex = Matrix.multiply([transformMat, vertex]);

                // Project to 2D: divide by w and translate/scale to viewport (i.e., window)
                let newVertexCartX = (newVertex.x / newVertex.w + 1) * this.canvas.width / 2;
                let newVertexCartY = (newVertex.y / newVertex.w + 1) * this.canvas.height / 2;

                // Return the transformed and projected vertex
                return { x: newVertexCartX, y: newVertexCartY };
            });

            // For each line segment in each edge
            model.edges.forEach((edge) => {
                for (let i = 0; i < edge.length - 1; i++) {
                    let startVertex = newVertices[edge[i]];
                    let endVertex = newVertices[edge[i + 1]];

                    // Draw the line segment on canvas
                    this.drawLine(startVertex.x, startVertex.y, endVertex.x, endVertex.y);
                }
            });
        });
    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {
            outcode += NEAR;
        }
        return outcode;
    }

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        let result = null;
        let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
        let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);

        // TODO: implement clipping here!

        return result;
    }

    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: CG.Vector3(
                    scene.view.prp[0],
                    scene.view.prp[1],
                    scene.view.prp[2]
                ),
                srp: CG.Vector3(
                    scene.view.srp[0],
                    scene.view.srp[1],
                    scene.view.srp[2]
                ),
                vup: CG.Vector3(
                    scene.view.vup[0],
                    scene.view.vup[1],
                    scene.view.vup[2]
                ),
                clip: [...scene.view.clip],
            },
            models: [],
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type, vertices: [], edges: [] };
            if (model.type === "generic") {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(
                        CG.Vector4(
                            scene.models[i].vertices[j][0],
                            scene.models[i].vertices[j][1],
                            scene.models[i].vertices[j][2],
                            1
                        )
                    );
                }
            } else if (model.type === "cube") {
                const { center, width, height, depth } = scene.models[i];
                const [cube_x, cube_y, cube_z] = center;
                const width_half = width / 2, height_half = height / 2, depth_half = depth / 2;

                model.vertices = [
                    // Top
                    CG.Vector4(cube_x - width_half, cube_y + height_half, cube_z + depth_half, 1), // left-front
                    CG.Vector4(cube_x - width_half, cube_y + height_half, cube_z - depth_half, 1), // left-back
                    CG.Vector4(cube_x + width_half, cube_y + height_half, cube_z - depth_half, 1), // right-back
                    CG.Vector4(cube_x + width_half, cube_y + height_half, cube_z + depth_half, 1), // right-front

                    // Bottom
                    CG.Vector4(cube_x - width_half, cube_y - height_half, cube_z + depth_half, 1), // left-front
                    CG.Vector4(cube_x - width_half, cube_y - height_half, cube_z - depth_half, 1), // left-back
                    CG.Vector4(cube_x + width_half, cube_y - height_half, cube_z - depth_half, 1), // right-back
                    CG.Vector4(cube_x + width_half, cube_y - height_half, cube_z + depth_half, 1), // right-front
                ];
                model.edges = [
                    // Top
                    [0, 1],
                    [1, 2],
                    [2, 3],
                    [3, 0],

                    // Bottom
                    [4, 5],
                    [5, 6],
                    [6, 7],
                    [7, 4],

                    // Sides
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7],
                ];
            } else if (model.type === "cylinder") {
                const { center, radius, height, sides } = scene.models[i];
                const [cylinder_x, cylinder_y, cylinder_z] = center;
                const hh = height / 2;

                for (let j = 0; j < sides; j++) {
                    const angle = (2 * Math.PI * j) / sides;
                    const x = cylinder_x + radius * Math.cos(angle);
                    const z = cylinder_z + radius * Math.sin(angle);

                    model.vertices.push(CG.Vector4(x, cylinder_y - hh, z, 1)); // Bottom circle vertex
                    model.vertices.push(CG.Vector4(x, cylinder_y + hh, z, 1)); // Top circle vertex
                    model.edges.push([2 * j, 2 * j + 1]); // Side edges

                    if (j > 0) {
                        model.edges.push([2 * j - 2, 2 * j]); // Connect bottom circle vertices
                        model.edges.push([2 * j - 1, 2 * j + 1]); // Connect top circle vertices
                    }
                }
                model.edges.push([2 * (sides - 1), 0]); // Bottom circle
                model.edges.push([2 * (sides - 1) + 1, 1]); // Top circle
            }
            else if (model.type === "cone") {
                const { center, radius, height, sides } = scene.models[i];
                const [cone_x, cone_y, cone_z] = center;
                const hh = height;

                // top point of the cone
                model.vertices.push(CG.Vector4(cone_x, cone_y + hh, cone_z, 1));

                for (let j = 0; j < sides; j++) {
                    const angle = (2 * Math.PI * j) / sides;
                    const x = cone_x + radius * Math.cos(angle);
                    const z = cone_z + radius * Math.sin(angle);

                    model.vertices.push(CG.Vector4(x, cone_y, z, 1)); // Base circle vertices
                    model.edges.push([0, j + 1]); // Connect point to each base vertex

                    if (j > 0) {
                        model.edges.push([j, j + 1]); // Connect base circle vertices
                    }
                }
                model.edges.push([sides, 1]);
            }
            else if (model.type === "sphere") {
                const { center, radius, slices, stacks } = scene.models[i];
                const [sphere_x, sphere_y, sphere_z] = center;

                // iterate through stacks from top to bottom
                for (let stack = 0; stack <= stacks; stack++) {
                    const phi = Math.PI * stack / stacks; // angle for the horizontal stack
                    const y = sphere_y + radius * Math.cos(phi); // height for the given stack

                    // circle for each layer
                    for (let slice = 0; slice <= slices; slice++) {
                        const theta = 2 * Math.PI * slice / slices; // angle for the vertical slices
                        const x = sphere_x + radius * Math.sin(phi) * Math.cos(theta); // x value of vertex
                        const z = sphere_z + radius * Math.sin(phi) * Math.sin(theta); // z value of vertex

                        model.vertices.push(CG.Vector4(x, y, z, 1));

                        // connect vertices within the same slice and with vertices in the corresponding position in the next stack
                        if (stack < stacks && slice < slices) {
                            let a = stack * (slices + 1) + slice; // current vertex within the slice
                            let b = a + slices + 1; // vertex in the next stack directly above the current vertex

                            model.edges.push([a, a + 1]); // line between this vertices within the same slice
                            model.edges.push([a, b]); // line between vertices in corresponding stack
                        }
                    }
                }
            }
            else {
                model.center = CG.Vector4(
                    scene.models[i].center[0],
                    scene.models[i].center[1],
                    scene.models[i].center[2],
                    1
                );
                for (let key in scene.models[i]) {
                    if (
                        scene.models[i].hasOwnProperty(key) &&
                        key !== "type" &&
                        key != "center"
                    ) {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }
            if (scene.models[i].hasOwnProperty("animation")) {
                model.animation = JSON.parse(
                    JSON.stringify(scene.models[i].animation)
                );
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }

    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = "#FF0000";
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
}

export { Renderer };
