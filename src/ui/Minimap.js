export class Minimap {
    constructor() {
        this.container = document.getElementById("minimap-content");
        this.playerDot = document.getElementById("minimap-player");
        this.dots = new Map(); // Guardar referencias a los puntos DOM para no recrearlos
        
        // Rango de detección en unidades de Babylon
        this.radarRange = 30; 
        
        // Tamaño visual del minimapa en píxeles (120x120 en CSS, radio=60)
        this.pixelRadius = 60; 
    }

    update(player, chests, enemies) {
        if (!player || !player.mesh) return;

        const playerPos = player.mesh.position;
        
        // 1. Rotar el indicador central (Jugador) para que apunte hacia donde mira
        // Convertir radianes a grados y ajustar offset
        const playerRotDegrees = player.mesh.rotation.y * (180 / Math.PI);
        this.playerDot.style.transform = `translate(-50%, -50%) rotate(${playerRotDegrees}deg)`;

        // Lista de IDs actualizados en este frame (para limpiar los que desaparecen)
        const updatedIds = new Set();

        // 2. Procesar Cofres (Puntos Dorados)
        if (chests) {
            for (let i = 0; i < chests.length; i++) {
                const chest = chests[i];
                if (chest && !chest.metadata.opened) { // Solo mostrar cofres cerrados
                    const id = `chest_${i}`;
                    updatedIds.add(id);
                    this.updateDot(id, chest.position, playerPos, 'dot-chest');
                }
            }
        }

        // 3. Procesar Enemigos (Puntos Rojos)
        if (enemies) {
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                if (enemy && enemy.hp > 0 && enemy.mesh) {
                    const id = `enemy_${i}`;
                    updatedIds.add(id);
                    this.updateDot(id, enemy.mesh.position, playerPos, 'dot-enemy');
                }
            }
        }

        // 4. Limpieza de memoria (Eliminar puntos de enemigos muertos o cofres abiertos)
        for (const id of this.dots.keys()) {
            if (!updatedIds.has(id)) {
                this.removeDot(id);
            }
        }
    }

    updateDot(id, objectPos, playerPos, cssClass) {
        // Calcular distancia real (3D)
        const dx = objectPos.x - playerPos.x;
        const dz = objectPos.z - playerPos.z; // Babylon Z es adelante/atrás
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Si está fuera del rango del radar, no lo dibujamos o lo ocultamos
        if (distance > this.radarRange) {
            if (this.dots.has(id)) {
                this.dots.get(id).style.display = 'none';
            }
            return;
        }

        // Obtener o crear el punto HTML
        let dot = this.dots.get(id);
        if (!dot) {
            dot = document.createElement("div");
            dot.className = `minimap-dot ${cssClass}`;
            this.container.appendChild(dot);
            this.dots.set(id, dot);
        }
        dot.style.display = 'block';

        // Escalar la posición 3D a Píxeles 2D
        // Mapeo: -radarRange -> 0px, 0 -> 60px (centro), +radarRange -> 120px
        const scale = this.pixelRadius / this.radarRange;
        
        // Centro del minimapa es 50% (60px)
        const mapX = 60 + (dx * scale);
        const mapY = 60 - (dz * scale); // Invertimos Z porque en HTML 'Y' crece hacia abajo

        dot.style.left = `${mapX}px`;
        dot.style.top = `${mapY}px`;
    }

    removeDot(id) {
        const dot = this.dots.get(id);
        if (dot) {
            if (dot.parentNode) dot.parentNode.removeChild(dot);
            this.dots.delete(id);
        }
    }
}