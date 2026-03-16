# Arquitectura de Software: Las Profundidades de Elyria

Este documento describe la estructura modular del motor del juego basado en BabylonJS y ES6 Modules.

## Principios de Diseño
1. **Modularidad:** Cada sistema tiene una única responsabilidad.
2. **Independencia de Cámara:** El movimiento y la lógica del jugador (`Player.js`) no asumen un tipo de cámara fija. Los `Controllers` dictan cómo se mapea la entrada a la cámara y al personaje.
3. **Arquitectura Escalable:** Los enemigos, las IAs y los objetos interactivos son componentes independientes.

## Estructura de Directorios (`src/`)

### 1. `game.js` (Punto de Entrada)
* **Responsabilidad:** Inicializar el motor BabylonJS (`BABYLON.Engine`), instanciar la Escena Principal y correr el Bucle de Renderizado (`RenderLoop`).
* **Conexión:** Escucha eventos del `MenuManager` para pausar o reanudar el juego.

### 2. `controllers/` (Controladores de Cámara y Movimiento)
* **Responsabilidad:** Traducen los *inputs* físicos (Joystick/Botones) a movimiento real en el mundo 3D, dependiendo del modo de visualización elegido por el jugador.
* **Componentes:**
  * `TopDownController.js`: Fija la cámara cenitalmente y mapea el joystick a los ejes cardinales estáticos.
  * `ShooterController.js`: Cámara libre rotacional. Mapea el joystick en relación a dónde mira la cámara (adelante siempre es adelante relativo a la visión).

### 3. `entities/` (Entidades del Mundo)
* **Responsabilidad:** Todo aquello que "está vivo" o puede reaccionar (Físicas, Mesh, Salud, Animaciones).
* **Componentes:**
  * `Player.js`: Lógica del héroe (Inventario, Mallas de armas, Animación de Ataque/Defensa).
  * `enemies/BaseEnemy.js`: Plantilla genérica para todo monstruo (Salud, Recepción de Daño, Muerte).
  * `enemies/ShadowRat.js`: Implementación específica de una Rata Gigante oscura.

### 4. `ai/` (Inteligencia Artificial)
* **Responsabilidad:** El "Cerebro" de las entidades enemigas. Separado del "Cuerpo" (`entities/`) para poder reutilizar IAs.
* **Componentes:**
  * `EnemyAI.js`: Máquina de Estados Finita (FSM). Evalúa la distancia al jugador y transiciona entre estados: `IDLE` (Espera) -> `CHASE` (Persecución) -> `ATTACK` (Ataque).

### 5. `scenes/` (Controladores de Nivel)
* **Responsabilidad:** Instanciar el nivel completo (Motor de Colisiones, Luces, Minimapa, Generador, Enemigos).
* **Componentes:**
  * `DungeonScene.js`: La mazmorra base del Capítulo 1. Gestiona el ciclo de vida (Tick/Update) de todas las entidades.

### 6. `ui/` (Interfaz de Usuario)
* **Responsabilidad:** Lógica HTML/CSS superpuesta al canvas 3D (Cómputo por Capas).
* **Componentes:**
  * `MenuManager.js`: Gestiona Pantalla de Título, Configuración y Menú de Pausa.
  * `HUD.js`: Muestra Oro, Inventario y Botones Mágicos.
  * `DialogueManager.js`: Sistema de Cajas de Texto estilo RPG con efecto de máquina de escribir.
  * `Minimap.js`: Radar táctico superior derecho (Convierte coordenadas 3D a Pixeles 2D en pantalla).

### 7. `world/` (Entorno Estático)
* **Responsabilidad:** Geometría del nivel que no cambia frecuentemente.
* **Componentes:**
  * `DungeonGenerator.js`: Algoritmo que construye el suelo, muros perimetrales, pilares, coloca cofres y luces/antorchas decorativas en las paredes.