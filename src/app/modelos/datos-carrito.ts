export interface ItemCandyCarrito { // unifica que se puedan agregar tanto combos como productos en el carrito
    tipo: 'producto' | 'combo';
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}