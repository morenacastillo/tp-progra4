export interface AltaEntrada {
    compra_id: number;
    funcion_id: number;
    butaca_id: number;
    combo_id: number | null;
    precio: number;
}

export interface AltaCandyVendido {
    compra_id: number;
    producto_id: number | null;
    combo_id: number | null;
    cantidad: number;
    precio_unitario: number;
}