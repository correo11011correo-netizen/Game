export class Player {
    constructor(scene, input, hud, dialogueManager) {
        this.scene = scene;
        this.input = input;
        this.hud = hud;
        this.dialogueManager = dialogueManager;
        
        // El jugador es temporalmente una cápsula
        this.mesh = BABYLON.MeshBuilder.CreateCapsule("player", { radius: 0.5, height: 2 }, scene);
        this.mesh.position.y = 1;
        
        // Físicas: Darle masa sólida al jugador
        this.mesh.checkCollisions = true; 
        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5); 
        this.mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

        const mat = new BABYLON.StandardMaterial("playerMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8); 
        this.mesh.material = mat;

        this.speed = 0.2; 
        this.isAttacking = false;
        this.isDefending = false;
        this.canMove = true;
        
        // Sistema de Inventario
        this.inventory = [];
        this.hasSword = false;
        this.hasShield = false;
        
        // Modelos visuales de las armas
        this.createVisualWeapons();
        
        // Orientación independiente
        this.mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    }

    createVisualWeapons() {
        this.swordMesh = BABYLON.MeshBuilder.CreateBox("sword", { width: 0.2, height: 1.5, depth: 0.2 }, this.scene);
        this.swordMesh.position = new BABYLON.Vector3(0.6, 0.5, 0.5); 
        this.swordMesh.rotation.x = Math.PI / 2; 
        this.swordMesh.parent = this.mesh;
        this.swordMesh.isVisible = false; 
        
        const swordMat = new BABYLON.StandardMaterial("swordMat", this.scene);
        swordMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); 
        this.swordMesh.material = swordMat;

        this.shieldMesh = BABYLON.MeshBuilder.CreateCylinder("shield", { height: 0.1, diameter: 1.2 }, this.scene);
        this.shieldMesh.position = new BABYLON.Vector3(-0.6, 0.5, 0.5); 
        this.shieldMesh.rotation.x = Math.PI / 2;
        this.shieldMesh.rotation.z = Math.PI / 2;
        this.shieldMesh.parent = this.mesh;
        this.shieldMesh.isVisible = false; 
        
        const shieldMat = new BABYLON.StandardMaterial("shieldMat", this.scene);
        shieldMat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1); 
        this.shieldMesh.material = shieldMat;
    }

    update(chests, enemies) {
        if (!this.canMove) return;

        const camera = this.scene.activeCamera;
        if (!camera) return;

        // 1. ROTACIÓN SHOOTER: El personaje siempre se orienta hacia donde mira la cámara
        // Obtenemos el vector "Adelante" de la cámara
        const cameraForward = camera.getForwardRay().direction;
        // Calculamos el ángulo en el plano XZ (suelo)
        const targetRotationY = Math.atan2(cameraForward.x, cameraForward.z);
        
        // Sincronizar rotación del personaje con la cámara
        this.mesh.rotation.y = targetRotationY;

        // 2. TRASLACIÓN: Movimiento relativo a la rotación actual (Strafing)
        if (this.input.joyX !== 0 || this.input.joyY !== 0) {
            if (!this.isDefending) {
                // Vector Adelante del personaje
                const forward = new BABYLON.Vector3(
                    Math.sin(this.mesh.rotation.y),
                    0,
                    Math.cos(this.mesh.rotation.y)
                );
                
                // Vector Derecha del personaje
                const right = new BABYLON.Vector3(
                    Math.cos(this.mesh.rotation.y),
                    0,
                    -Math.sin(this.mesh.rotation.y)
                );
                
                // Combinar ejes del joystick para movimiento lateral o frontal
                const moveDirection = right.scale(this.input.joyX).add(forward.scale(this.input.joyY));
                
                if (moveDirection.lengthSquared() > 0) {
                    moveDirection.normalize().scaleInPlace(this.speed);
                    moveDirection.y = -0.2; // Gravedad constante
                    this.mesh.moveWithCollisions(moveDirection);
                }
            }
        } else {
            // Aplicar gravedad siempre
            this.mesh.moveWithCollisions(new BABYLON.Vector3(0, -0.2, 0));
        }

        // Acciones y Combate
        if (this.input.actionA && !this.isAttacking && !this.isDefending) {
            if (this.hasSword) {
                this.attack(chests, enemies); 
            } else {
                this.input.actionA = false; 
                this.showMessage("Aún no tienes un arma. Busca en los cofres.");
            }
        }
        
        if (this.input.actionB) {
            if (this.hasShield) {
                this.defend();
            } else {
                this.input.actionB = false; 
                if(!this.isDefending) this.showMessage("Aún no tienes un escudo para defenderte.");
            }
        } else if (this.isDefending) {
            this.stopDefend();
        }

        this.checkInteractables(chests);
    }

    showMessage(text) {
        if (this.canMove) {
            this.canMove = false;
            this.dialogueManager.startDialogue([
                { speaker: "Sistema", text: text }
            ], () => {
                this.canMove = true;
            });
        }
    }

    checkInteractables(chests) {
        if (!chests) return;
        for (let chest of chests) {
            if (!chest.metadata.opened) {
                const distance = BABYLON.Vector3.Distance(this.mesh.position, chest.position);
                if (distance < 2.5) {
                    this.openChest(chest);
                }
            }
        }
    }

    openChest(chest) {
        chest.metadata.opened = true;
        const itemName = chest.metadata.item;
        chest.material.emissiveColor = new BABYLON.Color3(0, 0, 0); 
        chest.scaling.y = 0.3; 
        chest.position.y = 0.15; 
        this.inventory.push(itemName);
        if (itemName === "espada") {
            this.hasSword = true;
            this.swordMesh.isVisible = true; 
        }
        if (itemName === "escudo") {
            this.hasShield = true;
            this.shieldMesh.isVisible = true; 
        }
        this.hud.updateInventory(this.inventory);
        this.showMessage(`¡Has encontrado: ${itemName.toUpperCase()}!`);
    }

    attack(destructibles, enemies) {
        this.isAttacking = true;
        const anim = new BABYLON.Animation("atk", "rotation.x", 45, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [{ frame: 0, value: 0 }, { frame: 5, value: Math.PI / 2.5 }, { frame: 15, value: 0 }];
        anim.setKeys(keys);
        this.mesh.animations = [anim];
        
        if (enemies) {
            for (let enemy of enemies) {
                const dist = BABYLON.Vector3.Distance(this.mesh.position, enemy.mesh.position);
                if (dist < 3.0) enemy.takeDamage(10);
            }
        }

        if (destructibles) {
            for (let i = 0; i < destructibles.length; i++) {
                let obj = destructibles[i];
                if (obj && obj.metadata.opened && !obj.metadata.broken) {
                    const dist = BABYLON.Vector3.Distance(this.mesh.position, obj.position);
                    if (dist < 3.0) {
                        obj.metadata.broken = true; 
                        obj.dispose(); 
                        this.hud.updateGold(5); 
                        this.hud.updateDisplay();
                    }
                }
            }
        }

        this.scene.beginAnimation(this.mesh, 0, 15, false, 1, () => {
            this.isAttacking = false;
        });
    }

    defend() {
        if (!this.isDefending && !this.isAttacking) {
            this.isDefending = true;
            this.mesh.scaling.y = 0.8;
            this.mesh.position.y = 0.8;
            this.shieldMesh.position.x = 0; 
            this.shieldMesh.position.z = 1.0; 
            this.shieldMesh.material.emissiveColor = new BABYLON.Color3(0, 0.5, 1); 
        }
    }

    stopDefend() {
        this.isDefending = false;
        this.mesh.scaling.y = 1;
        this.mesh.position.y = 1;
        this.shieldMesh.position.x = -0.6; 
        this.shieldMesh.position.z = 0.5;
        this.shieldMesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0); 
    }
}