import { InputController } from '../utils/InputController.js';
import { HUD } from '../ui/HUD.js';
import { Player } from '../entities/Player.js';
import { DungeonGenerator } from '../world/DungeonGenerator.js';
import { DialogueManager } from '../ui/DialogueManager.js';
import { ShadowRat } from '../entities/enemies/ShadowRat.js';

export class DungeonScene {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }

    async createScene() {
        const scene = new BABYLON.Scene(this.engine);
        
        // Habilitar motor de colisiones
        scene.collisionsEnabled = true;
        
        // Color base de la cueva profunda
        scene.clearColor = new BABYLON.Color3(0.01, 0.01, 0.02);

        // Cámara en 3ra persona tipo Shooter / Action RPG
        // La cámara es libre (ArcRotate), pero el jugador siempre mirará hacia donde apunta el centro de la pantalla
        const camera = new BABYLON.ArcRotateCamera("ArcCam", -Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
        
        // Límites estrictos para la cámara
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 20;
        camera.lowerBetaLimit = 0.2; 
        camera.upperBetaLimit = Math.PI / 2.1;
        
        camera.checkCollisions = true; 
        camera.collisionRadius = new BABYLON.Vector3(1, 1, 1);
        
        // Permitir giro táctil en pantalla
        camera.attachControl(this.canvas, true); 
        camera.angularSensibilityX = 1000; 
        camera.angularSensibilityY = 1000; 
        camera.panningSensibility = 0; 
        camera.inertia = 0.8; 

        // Luces
        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.35;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0, 3, 0), scene);
        playerLight.intensity = 0;
        playerLight.diffuse = new BABYLON.Color3(1, 0.8, 0.5);
        playerLight.range = 25;

        const flashlight = new BABYLON.SpotLight("flashlight", new BABYLON.Vector3(0, 1, 0), new BABYLON.Vector3(0, -0.1, 1), Math.PI / 2.5, 5, scene);
        flashlight.intensity = 0;
        flashlight.diffuse = new BABYLON.Color3(1, 1, 1);
        flashlight.range = 50;

        // Sistemas Principales
        const input = new InputController();
        const hud = new HUD();
        const dialogue = new DialogueManager();
        
        const world = new DungeonGenerator(scene);
        world.generate();

        // Entidades
        const player = new Player(scene, input, hud, dialogue);
        camera.target = player.mesh.position; // La cámara sigue al jugador
        playerLight.parent = player.mesh;
        flashlight.parent = player.mesh;

        // Enemigos
        const enemies = [];
        try {
            enemies.push(new ShadowRat(scene, player, 0, 18));
            enemies.push(new ShadowRat(scene, player, 8, -12));
            enemies.push(new ShadowRat(scene, player, -12, -8));
        } catch (error) {
            console.error("Error al cargar enemigos:", error);
        }

        // Bloquear movimiento temporalmente para el inicio
        player.canMove = false; 

        // Historia Inicial
        setTimeout(() => {
            dialogue.startDialogue([
                { speaker: "Voz Desconocida", text: "¿Aún respiras, Buscador?" },
                { speaker: "Tú", text: "¿Dónde... dónde estoy? Mi cabeza da vueltas..." },
                { speaker: "Voz Desconocida", text: "En la tumba de la avaricia del Imperio de Elyria. Enciende tu luz..." }
            ], () => {
                playerLight.intensity = 1.0;
                flashlight.intensity = 2.5;
                setTimeout(() => {
                    dialogue.startDialogue([
                        { speaker: "Voz Desconocida", text: "Toma tu arma con fuerza. Ellos ya han olido tu luz. Sobrevive." }
                    ], () => {
                        player.canMove = true;
                    });
                }, 1000);
            });
        }, 1500);

        // Bucle Principal
        scene.onBeforeRenderObservable.add(() => {
            if(player.canMove !== false) {
                player.update(world.chests, enemies);
                
                // Actualizar la cámara para que siga al jugador suavemente
                camera.target = player.mesh.position;

                for (let i = enemies.length - 1; i >= 0; i--) {
                    if (enemies[i].hp <= 0) {
                        enemies.splice(i, 1);
                    } else {
                        enemies[i].update();
                    }
                }
            }
        });

        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.02;
        scene.fogColor = scene.clearColor;

        return scene;
    }
}