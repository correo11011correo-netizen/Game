// ItemDatabase.js - Sistema Centralizado de Objetos
export const ItemDatabase = {
    // Definición de todos los objetos del juego
    items: {
        "espada_basica": { id: "espada_basica", name: "Espada Oxidada", value: 10, icon: "🗡️", type: "weapon", damage: 5 },
        "espada_larga": { id: "espada_larga", name: "Espada Larga", value: 50, icon: "⚔️", type: "weapon", damage: 15 },
        "escudo_madera": { id: "escudo_madera", name: "Escudo de Madera", value: 15, icon: "🛡️", type: "shield", defense: 5 },
        "escudo_hierro": { id: "escudo_hierro", name: "Escudo de Hierro", value: 40, icon: "🛡️", type: "shield", defense: 15 },
        "pocion_vida": { id: "pocion_vida", name: "Poción Vida", value: 15, icon: "🧪", type: "consumable", heal: 25 },
        "gema": { id: "gema", name: "Gema Preciosa", value: 100, icon: "💎", type: "valuable" },
        "oro_pequeno": { id: "oro_pequeno", name: "Bolsita de Oro", value: 10, icon: "💰", type: "gold" },
        "oro_grande": { id: "oro_grande", name: "Bolsa Llena de Oro", value: 50, icon: "💰", type: "gold" },
        "poder_fuego": { id: "poder_fuego", name: "Aura de Fuego", value: 150, icon: "🔥", type: "companion_power", element: "fire" },
        "poder_hielo": { id: "poder_hielo", name: "Aura de Hielo", value: 150, icon: "❄️", type: "companion_power", element: "ice" }
    },

    // Obtener un objeto completo por su ID
    getItem(id) {
        if (this.items[id]) {
            return { ...this.items[id] }; // Devuelve una copia fresca
        }
        console.warn(`ItemDatabase: Objeto con ID ${id} no encontrado.`);
        return null;
    },

    // Generador de botín aleatorio para los cofres
    generateLoot(forceType = null) {
        let pool = Object.values(this.items);
        
        // Si se fuerza un tipo (ej. "weapon"), filtramos
        if (forceType) {
            pool = pool.filter(item => item.type === forceType);
        }

        // Devolver un elemento al azar de la pool
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        return { ...randomItem };
    }
};
