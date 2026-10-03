export interface GetCombo {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad_entradas: number;
    imagen_url: string;
    estado: boolean;
}

export interface AltaCombo {
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad_entradas: number;
    imagen_url: string;
}


export interface ComboProducto {
    combo_id: number;
    producto_id: number;
    cantidad: number;
}

export interface ItemCombo { // alta de combo x item
    producto_id: number;
    nombre: string;
    cantidad: number;
}