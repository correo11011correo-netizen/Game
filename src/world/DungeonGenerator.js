export class DungeonGenerator {
    constructor(scene) {
        this.scene = scene;
        
        // Materiales oscuros y rocosos para la mazmorra
        this.wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
        this.wallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.22);
        this.wallMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        this.floorMaterial = new BABYLON.StandardMaterial("floorMat", scene);
        this.floorMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); 
        this.floorMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        
        this.walls = [];
    }

    generate() {
        // Suelo principal (40x40 unidades)
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, this.scene);
        ground.material = this.floorMaterial;
        ground.checkCollisions = true; // Suelo sólido

        // Muros perimetrales gigantes
        this.createWall("wallN", 40, 6, 1, 0, 3, 20);
        this.createWall("wallS", 40, 6, 1, 0, 3, -20);
        this.createWall("wallE", 1, 6, 40, 20, 3, 0);
        this.createWall("wallW", 1, 6, 40, -20, 3, 0);

        // Generar pilares de ruinas aleatorios (Obstáculos)
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 36; // Entre -18 y 18
            const z = (Math.random() - 0.5) * 36;
            
            // Dejar la zona central (donde aparece el jugador) despejada
            if (Math.abs(x) > 4 || Math.abs(z) > 4) {
                // Variar el tamaño del pilar para dar aspecto irregular
                const sizeW = 1 + Math.random() * 2;
                const sizeD = 1 + Math.random() * 2;
                this.createWall(`pillar_${i}`, sizeW, 5, sizeD, x, 2.5, z);
            }
        }
        
        this.chests = [];
        // Cofre con la Espada oxidada
        this.createChest("chest_sword", "espada", -10, 0.5, 12);
        // Cofre con el Escudo viejo
        this.createChest("chest_shield", "escudo", 10, 0.5, 12);

        // --- DECORACIÓN: Antorchas de luz amarilla en los muros ---
        // Muro Norte
        this.createTorch("torch_n1", -10, 2.5, 19.5);
        this.createTorch("torch_n2", 10, 2.5, 19.5);
        // Muro Sur
        this.createTorch("torch_s1", -10, 2.5, -19.5);
        this.createTorch("torch_s2", 10, 2.5, -19.5);
        // Muro Este
        this.createTorch("torch_e1", 19.5, 2.5, -10);
        this.createTorch("torch_e2", 19.5, 2.5, 10);
        // Muro Oeste
        this.createTorch("torch_w1", -19.5, 2.5, -10);
        this.createTorch("torch_w2", -19.5, 2.5, 10);
    }

    createTorch(id, x, y, z) {
        // 1. Soporte físico de la antorcha (Un pequeño bloque de madera)
        const holder = BABYLON.MeshBuilder.CreateBox(`${id}_holder`, { width: 0.2, height: 0.5, depth: 0.2 }, this.scene);
        holder.position.set(x, y, z);
        
        // 2. Fuego (La punta incandescente)
        const fire = BABYLON.MeshBuilder.CreateBox(`${id}_fire`, { width: 0.3, height: 0.3, depth: 0.3 }, this.scene);
        fire.position.set(x, y + 0.3, z);
        
        // Material del fuego que "brilla en la oscuridad"
        const fireMat = new BABYLON.StandardMaterial(`${id}_fireMat`, this.scene);
        fireMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // Naranja base
        fireMat.emissiveColor = new BABYLON.Color3(1, 0.8, 0); // Brillo amarillo fuerte
        fireMat.disableLighting = true; // No le afecta la sombra, él emite luz
        fire.material = fireMat;

        // 3. Luz real (PointLight) que ilumina el muro cercano
        const light = new BABYLON.PointLight(`${id}_light`, new BABYLON.Vector3(x, y + 0.5, z), this.scene);
        light.diffuse = new BABYLON.Color3(1, 0.8, 0.2); // Color amarillo fuego cálido
        light.intensity = 1.2; // Brillo
        light.range = 10; // Distancia a la que llega la luz de la antorcha
    }

    createWall(name, w, h, d, x, y, z) {
        const wall = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, this.scene);
        wall.position.set(x, y, z);
        wall.material = this.wallMaterial;
        wall.checkCollisions = true; // Muro sólido
        this.walls.push(wall);
    }

    createChest(name, itemType, x, y, z) {
        const chest = BABYLON.MeshBuilder.CreateBox(name, { width: 1.5, height: 1, depth: 1 }, this.scene);
        chest.position.set(x, y, z);
        const chestMat = new BABYLON.StandardMaterial("chestMat", this.scene);
        chestMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.1); // Marrón madera
        chestMat.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0); // Ligero brillo
        chest.material = chestMat;
        chest.checkCollisions = true;
        
        chest.metadata = { item: itemType, opened: false };
        this.chests.push(chest);
    }
}