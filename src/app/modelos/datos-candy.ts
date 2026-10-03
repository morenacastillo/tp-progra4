export interface GetCategoria {
    id: number;
    nombre: string;
}

export interface GetProducto {
    id: number;
    categoria_id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    estado: boolean;
}

export interface AltaProducto {
    categoria_id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
}
