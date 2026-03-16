# Motor Reutilizable: Guía de Sistemas Modulares

Este proyecto ha sido estructurado no solo como un juego ("Las Profundidades de Elyria"), sino como un **Mini-Motor de Juegos Web 3D** altamente escalable. Cada carpeta en `src/` contiene sistemas desacoplados que pueden ser copiados, pegados y reutilizados en proyectos completamente diferentes.

A continuación se detalla la función de cada directorio y su potencial de reutilización.

---

## 🎮 1. `src/controllers/` (Sistemas de Cámara y Control)
**¿Qué hace?** Separa la lógica matemática de la cámara y el joystick del modelo 3D del jugador.
**Potencial de Reutilización (ALTO):**
*   **`TopDownController.js`**: Ideal para juegos tipo *Zelda*, *Brawl Stars* o *MOBA*. Mapea un joystick 2D a un plano 3D isométrico, forzando la rotación suave (`Lerp`) del modelo 3D.
*   **`ShooterController.js`**: Ideal para *Shooters en 3ra persona* (*Free Fire*, *PUBG*). Combina el arrastre táctil (Touch) para girar la cámara libremente, mientras que el joystick aplica movimiento relativo (*Strafing*) al vector `Forward` de la vista.

---

## 💡 2. `src/world/` y `src/scenes/` (Iluminación y Entorno)
**¿Qué hace?** Gestiona la generación procedural del terreno y las luces dinámicas.
**Potencial de Reutilización (MEDIO-ALTO):**
*   **Linterna Omnidireccional:** El código dentro de `DungeonScene.js` que usa Trigonometría Pura (`Math.sin`, `Math.cos` sobre `rotation.y`) para calcular el vector de un `SpotLight` es oro puro para cualquier juego de terror o exploración oscura. No depende del motor de físicas, por lo que nunca tiene "lag" de rotación.
*   **Flicker Effect (Parpadeo):** La lógica de asignar luces a un array `scene.torchLights` y variar su `intensity` con `Math.random()` en el bucle principal es reutilizable para simular fuego, farolas rotas o magia en cualquier entorno 3D.
*   **`DungeonGenerator.js`**: Su lógica matemática de "Cuadrículas y Puertas" (Grid-based Chunks) es la base para cualquier *Roguelike* o generador de laberintos procedurales.

---

## 🛡️ 3. `src/entities/` (Físicas y Colisiones Duras)
**¿Qué hace?** Define a los actores vivos (Jugador, Enemigos) y cómo interactúan físicamente con el mundo.
**Potencial de Reutilización (ALTO):**
*   **Sistema de "Hard-Collision":** Los motores web suelen tener problemas con la gravedad constante (los personajes se hunden en el suelo). El fragmento de código `if (mesh.position.y < LIMITE) mesh.position.y = LIMITE;` junto con `moveWithCollisions()` asegura que los modelos 3D jamás atraviesen el piso. Útil en **cualquier** juego 3D con gravedad.
*   **Detección de Daño en Área (AoE):** El bucle iterativo que usa `BABYLON.Vector3.Distance` dentro de `Player.js` para dañar o romper cofres cercanos es el estándar para combate cuerpo a cuerpo (Hack and Slash) sin depender de complejas cajas de colisión (Hitboxes).

---

## 🖥️ 4. `src/ui/` (Interfaz HTML/CSS Superpuesta)
**¿Qué hace?** Maneja toda la interfaz de usuario utilizando elementos del DOM (`div`, `button`) superpuestos al `<canvas>` 3D.
**Potencial de Reutilización (MUY ALTO):** Renderizar UI en 3D es costoso para los móviles. Esta técnica de usar HTML encima del Canvas es la más óptima.
*   **`Minimap.js` (Radar Mágico):** Extrae posiciones 3D (`X`, `Z`) y las traduce matemáticamente a un plano 2D (`Left`, `Top`) en píxeles usando una escala (`pixelRadius / radarRange`). Se puede usar en juegos de carreras, shooters o RPGs tácticos sin modificar su núcleo matemático.
*   **`DialogueManager.js`**: Un sistema completo de Cajas de Texto estilo RPG (*Final Fantasy*, *Pokémon*) con efecto de "Máquina de escribir" (Typewriter) mediante recursividad y `setTimeout`. Totalmente agnóstico del juego 3D.
*   **`MenuManager.js`**: Gestor de estados (State Machine) para la UI. Muestra/Oculta menús de pausa, configuraciones en vivo y pantallas de título sin afectar el bucle de renderizado.

---

## 🔊 5. `src/utils/` (Herramientas Core)
**¿Qué hace?** Scripts de ayuda técnica e infraestructura.
**Potencial de Reutilización (MUY ALTO):**
*   **`SoundManager.js` (Sintetizador 8-Bits):** Genera efectos de sonido desde cero utilizando la **Web Audio API** nativa (`OscillatorNode`, `GainNode`). ¡Cero descargas de archivos `.mp3` o `.wav`! Perfecto para Game Jams, prototipos rápidos o juegos ultraligeros. Genera espadazos (`triangle` wave), golpes graves (`square` wave) y magia (`sine` wave).
*   **`AssetManager.js`**: Pre-carga de recursos (Texturas, Modelos 3D). Garantiza que la GPU tenga todo en memoria antes de arrancar el nivel (`await loadAssets()`), evitando tirones de FPS en celulares de gama baja. Indispensable para cualquier juego web comercial.