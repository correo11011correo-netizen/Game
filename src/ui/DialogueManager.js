export class DialogueManager {
    constructor() {
        this.box = document.getElementById("dialogueBox");
        this.nameElement = document.getElementById("dialogueName");
        this.textElement = document.getElementById("dialogueText");
        this.avatarElement = document.getElementById("dialogueAvatar");
        
        this.dialogues = [];
        this.currentDialogIndex = 0;
        this.isTyping = false;
        this.typeSpeed = 30; // ms por letra
        this.currentTimeout = null;
        this.currentDialogueId = 0; // ID único para evitar sangrado de texto (bleeding)
        
        this.onDialogueEnd = null; // Callback para cuando termina la conversación

        // Evento para avanzar diálogo al tocar la caja
        // Usamos pointerdown en lugar de click/touchstart para evitar eventos dobles
        if (this.box) {
            this.box.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.advanceDialogue();
            });
        }
    }

    startDialogue(dialogueArray, onComplete = null) {
        if (!dialogueArray || dialogueArray.length === 0) return;
        
        this.dialogues = dialogueArray;
        this.currentDialogIndex = 0;
        this.onDialogueEnd = onComplete;
        
        if (this.box) this.box.style.display = "block";
        this.showCurrentDialogue();
    }

    showCurrentDialogue() {
        if (this.currentDialogIndex >= this.dialogues.length) {
            this.endDialogue();
            return;
        }

        const current = this.dialogues[this.currentDialogIndex];
        this.nameElement.textContent = current.speaker;
        this.textElement.textContent = "";
        
        if (this.avatarElement) {
            const speakerLow = current.speaker.toLowerCase();
            let icon = "🗣️";
            if (speakerLow.includes("sistema")) icon = "⚙️";
            else if (speakerLow.includes("tú") || speakerLow.includes("tu")) icon = "🧑";
            else if (speakerLow.includes("voz")) icon = "👻";
            this.avatarElement.textContent = icon;
        }
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        
        this.currentDialogueId++; // Invalidar cualquier escritura asíncrona anterior
        this.isTyping = true;
        this.typeText(current.text, 0, this.currentDialogueId);
    }

    typeText(text, index, dialogueId) {
        // Validación de seguridad absoluta:
        // Si el ID del ciclo actual no coincide con el que inició esta escritura, abortar.
        if (dialogueId !== this.currentDialogueId || !this.isTyping) {
            return;
        }

        if (index < text.length) {
            // Reemplazamos textContent += por substring para evitar que letras viejas se sumen a la cola
            this.textElement.textContent = text.substring(0, index + 1);
            
            this.currentTimeout = setTimeout(() => {
                this.typeText(text, index + 1, dialogueId);
            }, this.typeSpeed);
        } else {
            this.isTyping = false;
        }
    }

    advanceDialogue() {
        if (this.isTyping) {
            // Si está escribiendo, forzamos a que muestre todo el texto de golpe
            this.currentDialogueId++; // Cancelar próximos timeouts de este hilo
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
            }
            this.isTyping = false;
            this.textElement.textContent = this.dialogues[this.currentDialogIndex].text;
        } else {
            // Si ya terminó de escribir, pasamos al siguiente
            this.currentDialogIndex++;
            this.showCurrentDialogue();
        }
    }

    endDialogue() {
        if (this.box) this.box.style.display = "none";
        this.dialogues = [];
        this.currentDialogueId++; // Invalidar restos
        if (this.onDialogueEnd) {
            this.onDialogueEnd();
        }
    }
}
