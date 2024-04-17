import { createApp, reactive, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { Renderer } from './renderer.js';

let app = createApp({
    setup() {
        return {
            view: {
                id: 'view',
                width: 800,
                height: 600
            },
            renderer: ref({})
        }
    },

    methods: {
        loadNewScene() {
            let scene_file = document.getElementById('scene_file');

            let reader = new FileReader();
            reader.onload = (event) => {
                let scene = JSON.parse(event.target.result);
                this.renderer.updateScene(scene);
            };
            reader.readAsText(scene_file.files[0], 'UTF-8');
        },

        onKeyDown(event) {
            switch (event.keyCode) {
                case 37: // LEFT Arrow
                    this.renderer.rotateLeft();
                    break;
                case 39: // RIGHT Arrow
                    this.renderer.rotateRight();
                    break;
                case 65: // A key
                    this.renderer.moveLeft();
                    break;
                case 68: // D key
                    this.renderer.moveRight();
                    break;
                case 83: // S key
                    this.renderer.moveBackward();
                    break;
                case 87: // W key
                    this.renderer.moveForward();
                    break;
            }
        }
    }
}).mount('#content');

let initial_scene = {
    view: {
        prp: [44, 20, -16],
        srp: [20, 20, -40],
        vup: [0, 1, 0],
        clip: [-19, 5, -10, 8, 12, 100]
    },
    models: [
        {
            type: 'generic',
            vertices: [
                [0.0, 0.0, -30.0],
                [20.0, 0.0, -30.0],
                [20.0, 12.0, -30.0],
                [10.0, 20.0, -30.0],
                [0.0, 12.0, -30.0],
                [0.0, 0.0, -60.0],
                [20.0, 0.0, -60.0],
                [20.0, 12.0, -60.0],
                [10.0, 20.0, -60.0],
                [0.0, 12.0, -60.0]
            ],
            edges: [
                [0, 1, 2, 3, 4, 0],
                [5, 6, 7, 8, 9, 5],
                [0, 5],
                [1, 6],
                [2, 7],
                [3, 8],
                [4, 9]
            ]
        }, 
        {
            type: 'cube',
            center: [-14, 4, -10],
            width: 8,
            height: 8,
            depth: 8,
            animation: ["xy", 0.1]
        },
        {
            type: "cylinder",
            center: [5, 3, 0],
            radius: 3.5,
            height: 7,
            sides: 12,
            animation: ["x", -0.5]
        },
        {
            type: "sphere",
            center: [50, 3, -14],
            radius: 3.5,
            slices: 18,
            stacks: 15,
            animation: ["x", 0.5]
        }, 
        {
            type: "cone",
            center: [50, 3, -50],
            radius: 3.5,
            height: 7,
            sides: 12, 
            animation: ["y", 1]
        }
    ]
};

document.addEventListener('keydown', app.onKeyDown, false);

app.renderer = new Renderer(app.view, initial_scene);
window.requestAnimationFrame((timestamp) => {
    app.renderer.animate(timestamp);
});
