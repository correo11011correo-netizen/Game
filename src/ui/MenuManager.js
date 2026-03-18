export class MenuManager {
    constructor(onStartGame) {
        this.onStartGameCallback = onStartGame;
        this.gameIsRunning = false;
        
        // Elementos del DOM
        this.layerMenu = document.getElementById("menu-layer");
        this.mainMenu = document.getElementById("mainMenu");
        this.settingsMenu = document.getElementById("settingsMenu");
        this.uiLayer = document.getElementById("ui-layer");
        this.creditsPanel = document.getElementById("creditsPanel");

        // Botones
        this.btnResumeGame = document.getElementById("btnResumeGame");
        if (this.btnResumeGame) {
            this.btnResumeGame.addEventListener("click", () => this.startGame(false));
        }
        document.getElementById("btnNewGame").addEventListener("click", () => this.startGame(true));
        document.getElementById("btnSettingsMain").addEventListener("click", () => this.showSettings());
        document.getElementById("btnSaveSettings").addEventListener("click", () => this.hideSettings());
        
        // Botón de Pausa (Dentro del juego)
        document.getElementById("btnPause").addEventListener("click", () => {
            this.showMainMenu();
        });

        // Botón de Salir (Terminar Partida)
        const btnExitGame = document.getElementById("btnExitGame");
        if (btnExitGame) {
            btnExitGame.addEventListener("click", () => {
                // Lanzar evento para que el HUD muestre los logs
                window.dispatchEvent(new Event("exitGame"));
            });
        }

        // Créditos
        document.getElementById("btnCredits").addEventListener("click", () => this.toggleCredits());

        // Configuración por defecto
        this.config = {
            cameraMode: "SHOOTER",
            shadows: true,
            hero: "mago",
            companion: "ninguno",
            texturePack: "classic" // Nuevo parámetro
        };
    }

    showMainMenu() {
        this.uiLayer.style.display = "none";
        this.layerMenu.style.display = "flex";
        this.mainMenu.style.display = "block";
        this.settingsMenu.style.display = "none";
        
        // Mostrar botón de reanudar si el juego ya empezó
        if (this.gameIsRunning && this.btnResumeGame) {
            this.btnResumeGame.style.display = "block";
            document.getElementById("btnNewGame").textContent = "Reiniciar Partida";
        } else if (this.btnResumeGame) {
            this.btnResumeGame.style.display = "none";
            document.getElementById("btnNewGame").textContent = "Nueva Partida";
        }

        // Disparar evento para pausar el juego si ya estaba corriendo
        window.dispatchEvent(new Event("pauseGame"));
    }

    showSettings() {
        this.mainMenu.style.display = "none";
        this.settingsMenu.style.display = "block";
    }

    hideSettings() {
        // Leer la configuración seleccionada
        const camRadios = document.getElementsByName("camMode");
        for (let radio of camRadios) {
            if (radio.checked) {
                this.config.cameraMode = radio.value;
                break;
            }
        }
        
        const txSelect = document.getElementById("texturePackSelect");
        if (txSelect) this.config.texturePack = txSelect.value;
        
        this.config.shadows = document.getElementById("chkShadows").checked;

        this.settingsMenu.style.display = "none";
        this.mainMenu.style.display = "block";
    }

    startGame(isNewGame = false) {
        // Leer el héroe seleccionado antes de empezar
        if (isNewGame) {
            const heroSelect = document.getElementById("heroSelect");
            if (heroSelect) {
                this.config.hero = heroSelect.value;
            }

            const companionSelect = document.getElementById("companionSelect");
            if (companionSelect) {
                this.config.companion = companionSelect.value;
            }
            this.gameIsRunning = true;
        }

        this.layerMenu.style.display = "none";
        this.uiLayer.style.display = "block";
        this.creditsPanel.style.display = "none";
        
        // Ajustar UI según el modo
        const crosshair = document.getElementById("crosshair");
        if (this.config.cameraMode === "SHOOTER") {
            crosshair.style.display = "block";
        } else {
            crosshair.style.display = "none";
        }

        // Llamar a la función que arranca el juego con la config
        this.onStartGameCallback(this.config, isNewGame);
    }

    async toggleCredits() {
        if (this.creditsPanel.style.display === "none" || this.creditsPanel.style.display === "") {
            try {
                const res = await fetch(`data/comentarios.json?v=${Date.now()}`);
                const data = await res.json();
                this.creditsPanel.innerHTML = "<h3>👥 Aventureros</h3>";
                data.forEach(entry => {
                    this.creditsPanel.innerHTML += `<p><strong>${entry.usuario}</strong>:<br><i>"${entry.comentario}"</i></p>`;
                });
                this.creditsPanel.style.display = "block";
            } catch (err) {
                this.creditsPanel.innerHTML = "<p>El pergamino está dañado.</p>";
                this.creditsPanel.style.display = "block";
            }
        } else {
            this.creditsPanel.style.display = "none";
        }
    }
}