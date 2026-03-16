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
        this.mesh.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5); // El "tamaño" de su cuerpo para chocar
        this.mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

        const mat = new BABYLON.StandardMaterial("playerMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8); // Color de la túnica
        this.mesh.material = mat;

        this.speed = 0.2; // Un poco más rápido para compensar la fricción de colisiones
        this.isAttacking = false;
        this.isDefending = false;
        this.canMove = true;
        
        // Sistema de Inventario
        this.inventory = [];
        this.hasSword = false;
        this.hasShield = false;
        
        // Modelos visuales de las armas (Ocultos al inicio)
        this.createVisualWeapons();
        
        // Orientación independiente
        this.mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    }

    createVisualWeapons() {
        // Espada Visual
        this.swordMesh = BABYLON.MeshBuilder.CreateBox("sword", { width: 0.2, height: 1.5, depth: 0.2 }, this.scene);
        this.swordMesh.position = new BABYLON.Vector3(0.6, 0.5, 0.5); // Lado derecho
        this.swordMesh.rotation.x = Math.PI / 2; // Apuntando hacia adelante
        this.swordMesh.parent = this.mesh;
        this.swordMesh.isVisible = false; // Oculta hasta encontrarla
        
        const swordMat = new BABYLON.StandardMaterial("swordMat", this.scene);
        swordMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Gris metálico
        this.swordMesh.material = swordMat;

        // Escudo Visual
        this.shieldMesh = BABYLON.MeshBuilder.CreateCylinder("shield", { height: 0.1, diameter: 1.2 }, this.scene);
        this.shieldMesh.position = new BABYLON.Vector3(-0.6, 0.5, 0.5); // Lado izquierdo
        this.shieldMesh.rotation.x = Math.PI / 2;
        this.shieldMesh.rotation.z = Math.PI / 2;
        this.shieldMesh.parent = this.mesh;
        this.shieldMesh.isVisible = false; // Oculto hasta encontrarlo
        
        const shieldMat = new BABYLON.StandardMaterial("shieldMat", this.scene);
        shieldMat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1); // Madera oscura
        this.shieldMesh.material = shieldMat;
    }

    update(chests, enemies) {
        if (!this.canMove) return;

        // Moverse usando Físicas (moveWithCollisions) Relativo a la Cámara
        if (this.input.joyX !== 0 || this.input.joyY !== 0) {
            if (!this.isDefending) {
                const camera = this.scene.activeCamera;
                
                // Obtener hacia dónde mira la cámara en el plano 2D (suelo)
                const forward = camera.getForwardRay().direction;
                forward.y = 0; // Ignorar si miramos arriba o abajo
                forward.normalize();
                
                // Calcular el vector derecho de la cámara (Producto cruz)
                const right = new BABYLON.Vector3(forward.z, 0, -forward.x);
                
                // Mover adelante/atrás basado en joyY, Mover izquierda/derecha basado en joyX
                const moveX = right.scale(this.input.joyX);
                const moveZ = forward.scale(this.input.joyY);
                
                const moveDirection = moveX.add(moveZ);
                
                if (moveDirection.lengthSquared() > 0) {
                    moveDirection.normalize().scaleInPlace(this.speed);
                    
                    // Rotar hacia la dirección del movimiento
                    const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
                    this.mesh.rotation.y = targetAngle;
                    
                    // Gravedad
                    moveDirection.y = -0.2;
                    this.mesh.moveWithCollisions(moveDirection);
                }
            }
        } else {
            // Aplicar siempre gravedad aunque no se mueva
            this.mesh.moveWithCollisions(new BABYLON.Vector3(0, -0.2, 0));
        }

        // Acciones y Combate
        if (this.input.actionA && !this.isAttacking && !this.isDefending) {
            if (this.hasSword) {
                this.attack(chests, enemies); // Pasamos los cofres y enemigos
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

        // Interacción con objetos del entorno (Cofres)
        this.checkInteractables(chests);
    }

    showMessage(text) {
        // Evitar múltiples mensajes si ya está pausado
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
        
        // Efecto visual de "cofre abierto"
        chest.material.emissiveColor = new BABYLON.Color3(0, 0, 0); 
        chest.scaling.y = 0.3; 
        chest.position.y = 0.15; 
        
        // Añadir al inventario y hacer visible
        this.inventory.push(itemName);
        if (itemName === "espada") {
            this.hasSword = true;
            this.swordMesh.isVisible = true; // ¡La espada aparece en la mano!
        }
        if (itemName === "escudo") {
            this.hasShield = true;
            this.shieldMesh.isVisible = true; // ¡El escudo aparece en la mano!
        }
        
        this.hud.updateInventory(this.inventory);
        this.showMessage(`¡Has encontrado: ${itemName.toUpperCase()}!`);
    }

    attack(destructibles, enemies) {
        this.isAttacking = true;
        
        // Animación de ataque (Baja y sube la espada)
        const anim = new BABYLON.Animation("atk", "rotation.x", 45, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            { frame: 0, value: 0 },
            { frame: 5, value: Math.PI / 2.5 }, // Golpe seco hacia abajo
            { frame: 15, value: 0 }
        ];
        anim.setKeys(keys);
        this.mesh.animations = [anim];
        
        // Dañar Enemigos
        if (enemies) {
            for (let enemy of enemies) {
                const dist = BABYLON.Vector3.Distance(this.mesh.position, enemy.mesh.position);
                // Si el enemigo está en rango de espada
                if (dist < 3.0) {
                    enemy.takeDamage(10); // Nuestra espada hace 10 de daño
                }
            }
        }

        // Detectar si golpea algo rompible (Cofres ya abiertos, por ejemplo)
        if (destructibles) {
            for (let i = 0; i < destructibles.length; i++) {
                let obj = destructibles[i];
                // Si el cofre ya fue abierto y el jugador ataca cerca, ¡Lo rompe!
                if (obj && obj.metadata.opened && !obj.metadata.broken) {
                    const dist = BABYLON.Vector3.Distance(this.mesh.position, obj.position);
                    if (dist < 3.0) {
                        obj.metadata.broken = true; // Marcar como roto
                        obj.dispose(); // Destruye el modelo 3D del mundo (desaparece)
                        
                        // Pequeño efecto de "salto" de oro visual
                        this.hud.updateGold(5); // Romper cofres viejos da oro escondido
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
            
            // Animación: Poner el escudo frente a él y agacharse ligeramente
            this.mesh.scaling.y = 0.8;
            this.mesh.position.y = 0.8;
            this.shieldMesh.position.x = 0; // Mueve el escudo al centro
            this.shieldMesh.position.z = 1.0; // Lo adelanta
            this.shieldMesh.material.emissiveColor = new BABYLON.Color3(0, 0.5, 1); // Brillo mágico defensivo
        }
    }

    stopDefend() {
        this.isDefending = false;
        
        // Volver a la normalidad
        this.mesh.scaling.y = 1;
        this.mesh.position.y = 1;
        this.shieldMesh.position.x = -0.6; // Vuelve al lado
        this.shieldMesh.position.z = 0.5;
        this.shieldMesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Apagar brillo
    }
}