export const AI_STATES = {
    IDLE: 'IDLE',
    CHASE: 'CHASE',
    ATTACK: 'ATTACK',
    DEAD: 'DEAD'
};

export class EnemyAI {
    constructor(enemy, target, detectionRange = 10, attackRange = 1.5) {
        this.enemy = enemy;       // El monstruo que controla esta IA
        this.target = target;     // A quién persigue (El Jugador)
        this.state = AI_STATES.IDLE;
        
        this.detectionRange = detectionRange;
        this.attackRange = attackRange;
    }

    update() {
        if (this.state === AI_STATES.DEAD) return;

        // Calcular distancia al objetivo
        const distance = BABYLON.Vector3.Distance(this.enemy.mesh.position, this.target.mesh.position);

        // Toma de decisiones (Transiciones de estado)
        if (distance > this.detectionRange) {
            this.state = AI_STATES.IDLE;
        } else if (distance <= this.detectionRange && distance > this.attackRange) {
            this.state = AI_STATES.CHASE;
        } else if (distance <= this.attackRange) {
            this.state = AI_STATES.ATTACK;
        }

        // Ejecutar acción basada en el estado actual
        switch (this.state) {
            case AI_STATES.IDLE:
                this.enemy.idle();
                break;
            case AI_STATES.CHASE:
                this.enemy.chase(this.target);
                break;
            case AI_STATES.ATTACK:
                this.enemy.attackTarget(this.target);
                break;
        }
    }
}