import { BaseEnemy } from './BaseEnemy.js';

export class ShadowRat extends BaseEnemy {
    constructor(scene, target, x, z) {
        // Llama al constructor base con: Vida = 20, Velocidad = 0.08, Daño = 5
        super(scene, "Rata de Sombra", 20, 0.08, 5, target);

        // Personalizar el modelo visual 3D
        this.mesh.dispose(); // Borra la caja generada por defecto
        
        // Creamos una cápsula achatada simulando una rata gigante
        this.mesh = BABYLON.MeshBuilder.CreateCapsule("shadowRat", { radius: 0.4, height: 1.2 }, scene);
        this.mesh.rotation.x = Math.PI / 2; // Acostada
        this.mesh.position.set(x, 0.5, z);
        
        // Físicas (Caja de colisiones de la rata)
        this.mesh.checkCollisions = true;
        this.mesh.ellipsoid = new BABYLON.Vector3(0.4, 0.4, 0.6);
        this.mesh.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0);

        // Material oscuro y peludo
        const mat = new BABYLON.StandardMaterial("ratMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.08); // Casi negra
        mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Poco brillo
        // Sus "ojos" brillarán en rojo oscuro en la oscuridad
        mat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
        
        this.mesh.material = mat;
        
        // Opcional: Modificar parámetros de su Inteligencia Artificial
        this.ai.detectionRange = 15; // Las ratas huelen de lejos
        this.ai.attackRange = 1.8;
    }
}